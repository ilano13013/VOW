-- =============================================================================
-- VOW. — core schema: events, guests, RSVPs.
--
-- Security model
--   * Organizers authenticate with Supabase Auth. Every private table has RLS,
--     scoped to the owner of the event (auth.uid()).
--   * Guests never authenticate and never read tables directly. They hold a
--     personal 192-bit token and go through two SECURITY DEFINER functions:
--     get_invitation() and submit_rsvp(). Those functions return only that
--     guest's own data, so the guest list is never exposed.
--   * Plan, guest limit and payment status are written by the server
--     (service role / Stripe webhook), never by the organizer.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- 24 random bytes → 32 URL-safe characters (192 bits of entropy).
create or replace function public.generate_guest_token()
returns text
language sql
volatile
set search_path = ''
as $$
  select translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/', '-_')
$$;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create or replace function private.plan_guest_limit(p_plan text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case p_plan when 'essential' then 80 when 'signature' then 200 when 'couture' then 500 end
$$;

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table public.events (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug            text not null unique
                  check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$'),
  status          text not null default 'draft' check (status in ('draft', 'published')),
  plan            text not null default 'essential' check (plan in ('essential', 'signature', 'couture')),
  guest_limit     integer not null default 80 check (guest_limit between 1 and 1000),
  payment_status  text not null default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  content         jsonb not null default '{}'::jsonb
                  check (jsonb_typeof(content) = 'object' and pg_column_size(content) < 200000),
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index events_owner_idx on public.events (owner_id);

create trigger events_touch before update on public.events
  for each row execute function private.touch_updated_at();

-- Keep guest_limit in sync with the plan and stamp the publication date.
create or replace function private.events_derive()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.plan is distinct from old.plan then
    new.guest_limit := private.plan_guest_limit(new.plan);
  end if;
  if new.status = 'published' and (tg_op = 'INSERT' or old.status <> 'published') then
    new.published_at := now();
  end if;
  return new;
end
$$;
create trigger events_derive before insert or update on public.events
  for each row execute function private.events_derive();

-- ---------------------------------------------------------------------------
-- guests
-- ---------------------------------------------------------------------------
create table public.guests (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events (id) on delete cascade,
  name            text not null check (char_length(btrim(name)) between 1 and 120),
  email           text check (email is null or (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  max_companions  integer not null default 0 check (max_companions between 0 and 10),
  note            text check (note is null or char_length(note) <= 500),
  token           text not null unique default public.generate_guest_token()
                  check (token ~ '^[A-Za-z0-9_-]{32}$'),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index guests_event_idx on public.guests (event_id);

create trigger guests_touch before update on public.guests
  for each row execute function private.touch_updated_at();

-- Enforce the plan's guest limit server-side.
create or replace function private.guests_enforce_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit integer;
  v_count integer;
begin
  select guest_limit into v_limit from public.events where id = new.event_id for update;
  select count(*) into v_count from public.guests where event_id = new.event_id;
  if v_count >= v_limit then
    raise exception 'VOW_GUEST_LIMIT_REACHED' using errcode = 'P0001',
      detail = format('This plan allows %s guests.', v_limit);
  end if;
  return new;
end
$$;
create trigger guests_enforce_limit before insert on public.guests
  for each row execute function private.guests_enforce_limit();

-- ---------------------------------------------------------------------------
-- rsvps (one per guest; a guest may update their answer until the deadline)
-- ---------------------------------------------------------------------------
create table public.rsvps (
  guest_id         uuid primary key references public.guests (id) on delete cascade,
  event_id         uuid not null references public.events (id) on delete cascade,
  attending        boolean not null,
  respondent_name  text not null check (char_length(btrim(respondent_name)) between 1 and 120),
  companions       integer not null default 0 check (companions between 0 and 10),
  dietary          text check (dietary is null or char_length(dietary) <= 500),
  message          text check (message is null or char_length(message) <= 1000),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index rsvps_event_idx on public.rsvps (event_id);

create trigger rsvps_touch before update on public.rsvps
  for each row execute function private.touch_updated_at();

-- Abuse protection log (not exposed through the API).
create table private.rsvp_attempts (
  id          bigint generated always as identity primary key,
  guest_id    uuid,
  ip          text,
  created_at  timestamptz not null default now()
);
create index rsvp_attempts_guest_idx on private.rsvp_attempts (guest_id, created_at);
create index rsvp_attempts_ip_idx on private.rsvp_attempts (ip, created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps  enable row level security;

create or replace function private.owns_event(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.events e where e.id = p_event_id and e.owner_id = auth.uid())
$$;

create policy events_owner_select on public.events for select to authenticated
  using (owner_id = auth.uid());
create policy events_owner_insert on public.events for insert to authenticated
  with check (owner_id = auth.uid());
create policy events_owner_update on public.events for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy events_owner_delete on public.events for delete to authenticated
  using (owner_id = auth.uid());

create policy guests_owner_select on public.guests for select to authenticated
  using (private.owns_event(event_id));
create policy guests_owner_insert on public.guests for insert to authenticated
  with check (private.owns_event(event_id));
create policy guests_owner_update on public.guests for update to authenticated
  using (private.owns_event(event_id)) with check (private.owns_event(event_id));
create policy guests_owner_delete on public.guests for delete to authenticated
  using (private.owns_event(event_id));

create policy rsvps_owner_select on public.rsvps for select to authenticated
  using (private.owns_event(event_id));
create policy rsvps_owner_delete on public.rsvps for delete to authenticated
  using (private.owns_event(event_id));

-- ---------------------------------------------------------------------------
-- Privileges: Supabase grants ALL on public tables to anon/authenticated by
-- default. Reset them and grant only what each role needs, column by column.
-- ---------------------------------------------------------------------------
revoke all on public.events, public.guests, public.rsvps from anon, authenticated;
revoke all on all tables in schema private from anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;

grant select on public.events to authenticated;
grant insert (slug, content) on public.events to authenticated;
grant update (slug, content, status) on public.events to authenticated;
grant delete on public.events to authenticated;

grant select on public.guests to authenticated;
grant insert (event_id, name, email, max_companions, note) on public.guests to authenticated;
grant update (name, email, max_companions, note) on public.guests to authenticated;
grant delete on public.guests to authenticated;

grant select, delete on public.rsvps to authenticated;

-- RLS policy helper must be callable by the policy's role.
grant usage on schema private to authenticated;
grant execute on function private.owns_event(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Guest-facing API (token-scoped)
-- ---------------------------------------------------------------------------

-- Returns the published invitation for one guest, or NULL for any invalid,
-- unknown or unpublished token (no distinction is leaked).
create or replace function public.get_invitation(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_guest record;
  v_rsvp  jsonb;
begin
  if p_token is null or p_token !~ '^[A-Za-z0-9_-]{32}$' then
    return null;
  end if;

  select g.id, g.name, g.max_companions, e.content, e.status
    into v_guest
    from public.guests g
    join public.events e on e.id = g.event_id
   where g.token = p_token;

  if not found or v_guest.status <> 'published' then
    return null;
  end if;

  select jsonb_build_object(
           'attending', r.attending,
           'respondentName', r.respondent_name,
           'companions', r.companions,
           'dietary', r.dietary,
           'message', r.message,
           'updatedAt', r.updated_at)
    into v_rsvp
    from public.rsvps r
   where r.guest_id = v_guest.id;

  return jsonb_build_object(
    'guest', jsonb_build_object('name', v_guest.name, 'maxCompanions', v_guest.max_companions),
    'content', v_guest.content,
    'rsvp', v_rsvp);
end
$$;

-- Validates and records one guest's answer. Never raises for bad input:
-- returns {ok:false, error:<code>} so that the attempt log is kept.
create or replace function public.submit_rsvp(
  p_token       text,
  p_attending   boolean,
  p_name        text,
  p_companions  integer default 0,
  p_dietary     text default null,
  p_message     text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_guest_id  uuid;
  v_event_id  uuid;
  v_max       integer;
  v_status    text;
  v_content   jsonb;
  v_ip        text;
  v_deadline  date;
  v_name      text := btrim(coalesce(p_name, ''));
  v_dietary   text := nullif(btrim(coalesce(p_dietary, '')), '');
  v_message   text := nullif(btrim(coalesce(p_message, '')), '');
  v_comp      integer := coalesce(p_companions, 0);
  v_count     integer;
begin
  -- Caller IP as forwarded by the Supabase API gateway (absent in direct SQL).
  begin
    v_ip := split_part(current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for', ',', 1);
  exception when others then
    v_ip := null;
  end;
  v_ip := nullif(btrim(v_ip), '');

  delete from private.rsvp_attempts where created_at < now() - interval '1 day';

  if v_ip is not null then
    select count(*) into v_count from private.rsvp_attempts
     where ip = v_ip and created_at > now() - interval '10 minutes';
    if v_count >= 30 then
      return jsonb_build_object('ok', false, 'error', 'rate_limited');
    end if;
  end if;

  if p_token is not null and p_token ~ '^[A-Za-z0-9_-]{32}$' then
    select g.id, g.event_id, g.max_companions, e.status, e.content
      into v_guest_id, v_event_id, v_max, v_status, v_content
      from public.guests g
      join public.events e on e.id = g.event_id
     where g.token = p_token;
  end if;

  insert into private.rsvp_attempts (guest_id, ip) values (v_guest_id, v_ip);

  if v_guest_id is null or v_status <> 'published' then
    return jsonb_build_object('ok', false, 'error', 'invalid_invitation');
  end if;

  select count(*) into v_count from private.rsvp_attempts
   where guest_id = v_guest_id and created_at > now() - interval '1 hour';
  if v_count > 10 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  begin
    v_deadline := (v_content ->> 'rsvpDeadline')::date;
  exception when others then
    v_deadline := null;
  end;
  if v_deadline is not null and (now() at time zone 'Europe/Paris')::date > v_deadline then
    return jsonb_build_object('ok', false, 'error', 'rsvp_closed');
  end if;

  if p_attending is null then
    return jsonb_build_object('ok', false, 'error', 'attending_required');
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 120 then
    return jsonb_build_object('ok', false, 'error', 'invalid_name');
  end if;
  if not p_attending then
    v_comp := 0;
  end if;
  if v_comp < 0 or v_comp > v_max then
    return jsonb_build_object('ok', false, 'error', 'invalid_companions');
  end if;
  if char_length(coalesce(v_dietary, '')) > 500 then
    return jsonb_build_object('ok', false, 'error', 'invalid_dietary');
  end if;
  if char_length(coalesce(v_message, '')) > 1000 then
    return jsonb_build_object('ok', false, 'error', 'invalid_message');
  end if;

  insert into public.rsvps (guest_id, event_id, attending, respondent_name, companions, dietary, message)
  values (v_guest_id, v_event_id, p_attending, v_name, v_comp, v_dietary, v_message)
  on conflict (guest_id) do update
     set attending = excluded.attending,
         respondent_name = excluded.respondent_name,
         companions = excluded.companions,
         dietary = excluded.dietary,
         message = excluded.message;

  return jsonb_build_object('ok', true);
end
$$;

-- Owner-only: invalidate a guest link and issue a new one.
create or replace function public.regenerate_guest_token(p_guest_id uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_token text;
begin
  update public.guests g
     set token = public.generate_guest_token()
   where g.id = p_guest_id
     and exists (select 1 from public.events e where e.id = g.event_id and e.owner_id = auth.uid())
  returning g.token into v_token;
  if v_token is null then
    raise exception 'VOW_NOT_FOUND' using errcode = 'P0002';
  end if;
  return v_token;
end
$$;

revoke all on function public.get_invitation(text) from public;
revoke all on function public.submit_rsvp(text, boolean, text, integer, text, text) from public;
revoke all on function public.regenerate_guest_token(uuid) from public;
revoke all on function public.generate_guest_token() from public, anon, authenticated;
-- Needed because the column default runs with the inserting organizer's rights;
-- harmless (returns random bytes) and the token column itself is not writable.
grant execute on function public.generate_guest_token() to authenticated;

grant execute on function public.get_invitation(text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, boolean, text, integer, text, text) to anon, authenticated;
grant execute on function public.regenerate_guest_token(uuid) to authenticated;
