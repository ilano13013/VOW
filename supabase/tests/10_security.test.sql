-- =============================================================================
-- VOW. database tests: permissions, isolation, server-side RSVP validation and
-- abuse limits. Run with `npm run test:db` (see README). Fails on first error.
-- =============================================================================
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on

create schema if not exists tests;
grant usage on schema tests to anon, authenticated;
create or replace function tests.ok(cond boolean, label text) returns void language plpgsql as $$
begin
  if cond is distinct from true then raise exception 'FAILED: %', label; end if;
  raise notice 'ok - %', label;
end $$;
grant execute on function tests.ok(boolean, text) to anon, authenticated;

-- Expect a statement to be refused (permission or RLS error).
create or replace function tests.refused(stmt text, label text) returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when insufficient_privilege or check_violation or raise_exception or no_data_found then
    raise notice 'ok - % (refused: %)', label, sqlerrm;
    return;
  end;
  raise exception 'FAILED: % (statement was allowed)', label;
end $$;
grant execute on function tests.refused(text, text) to anon, authenticated;

-- Fixtures (as superuser) --------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-00000000000a', 'alice@example.test'),
  ('00000000-0000-4000-8000-00000000000b', 'bruno@example.test');

create temp table ctx (k text primary key, v text);
grant all on ctx to anon, authenticated;

-- Alice: creates and fills her event -------------------------------------------
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000a"}', false);

insert into public.events (slug, content)
values ('alice-et-sam', '{"partnerOne":"Alice","partnerTwo":"Sam","rsvpDeadline":"2099-12-31"}');
insert into ctx select 'event', id::text from public.events where slug = 'alice-et-sam';
select tests.ok((select owner_id from public.events where slug = 'alice-et-sam') = '00000000-0000-4000-8000-00000000000a', 'owner_id defaults to auth.uid()');
select tests.ok((select guest_limit from public.events where slug = 'alice-et-sam') = 80, 'essential plan defaults to an 80 guest limit');

insert into public.guests (event_id, name, max_companions)
values ((select v::uuid from ctx where k = 'event'), 'Claire Martin', 1),
       ((select v::uuid from ctx where k = 'event'), 'Hugo Bernard', 0);
insert into ctx select 'token_claire', token from public.guests where name = 'Claire Martin';
insert into ctx select 'token_hugo', token from public.guests where name = 'Hugo Bernard';
select tests.ok((select v from ctx where k = 'token_claire') ~ '^[A-Za-z0-9_-]{32}$', 'guest tokens are 32 URL-safe chars');
select tests.ok((select count(distinct token) from public.guests) = 2, 'guest tokens are unique');

select tests.refused($$update public.events set plan = 'couture'$$, 'organizer cannot change their plan');
select tests.refused($$update public.events set payment_status = 'paid'$$, 'organizer cannot mark the event as paid');
select tests.refused($$update public.events set owner_id = '00000000-0000-4000-8000-00000000000b'$$, 'organizer cannot transfer ownership');
select tests.refused($$update public.guests set token = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'$$, 'organizer cannot set a token by hand');
select tests.refused($$insert into private.rsvp_attempts (guest_id) values (null)$$, 'organizer cannot touch the abuse log');

-- Bruno: must not see or alter Alice's data -------------------------------------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000b"}', false);
select tests.ok((select count(*) from public.events) = 0, 'another organizer sees none of her events');
select tests.ok((select count(*) from public.guests) = 0, 'another organizer sees none of her guests');
update public.events set content = '{}' where slug = 'alice-et-sam';
select tests.ok((select count(*) from public.events) = 0, 'another organizer cannot update her event (0 rows)');
select tests.refused(format($$insert into public.guests (event_id, name) values (%L, 'Intrus')$$, (select v from ctx where k = 'event')), 'another organizer cannot add guests to her event');
select tests.refused(format($$select public.regenerate_guest_token(id) from (select %L::uuid as id) s$$, (select id::text from public.guests limit 1)), 'regenerate_guest_token is owner-only');

-- Anonymous guest ---------------------------------------------------------------
reset role;
set role anon;
select set_config('request.jwt.claims', '', false);
select tests.refused($$select * from public.guests$$, 'anon cannot read the guest list');
select tests.refused($$select * from public.events$$, 'anon cannot read events');
select tests.refused($$select * from public.rsvps$$, 'anon cannot read RSVPs');
select tests.ok(public.get_invitation((select v from ctx where k = 'token_claire')) is null, 'draft invitation is not served');
select tests.ok((public.submit_rsvp((select v from ctx where k = 'token_claire'), true, 'Claire') ->> 'error') = 'invalid_invitation', 'no RSVP on a draft');

-- Alice publishes ----------------------------------------------------------------
reset role;
select tests.ok((select content ->> 'partnerOne' from public.events where slug = 'alice-et-sam') = 'Alice', 'her content is intact after the foreign update attempt');
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000a"}', false);
update public.events set status = 'published' where slug = 'alice-et-sam';
select tests.ok((select published_at is not null from public.events where slug = 'alice-et-sam'), 'publishing stamps published_at');

reset role;
set role anon;
select set_config('request.jwt.claims', '', false);
select tests.ok((public.get_invitation((select v from ctx where k = 'token_claire')) -> 'guest' ->> 'name') = 'Claire Martin', 'guest receives their own invitation');
select tests.ok(public.get_invitation((select v from ctx where k = 'token_claire'))::text not like '%Hugo%', 'invitation never contains other guests');
select tests.ok(public.get_invitation('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') is null, 'unknown token returns nothing');
select tests.ok(public.get_invitation('x'' or 1=1 --') is null, 'malformed token returns nothing');

select tests.ok((public.submit_rsvp((select v from ctx where k = 'token_claire'), true, 'Claire', 2) ->> 'error') = 'invalid_companions', 'more companions than allowed is rejected');
select tests.ok((public.submit_rsvp((select v from ctx where k = 'token_claire'), true, '   ') ->> 'error') = 'invalid_name', 'blank name is rejected');
select tests.ok((public.submit_rsvp((select v from ctx where k = 'token_claire'), true, repeat('a', 121)) ->> 'error') = 'invalid_name', 'over-long name is rejected');
select tests.ok((public.submit_rsvp((select v from ctx where k = 'token_claire'), null, 'Claire') ->> 'error') = 'attending_required', 'attendance is required');
select tests.ok((public.submit_rsvp((select v from ctx where k = 'token_claire'), true, 'Claire', 0, repeat('a', 501)) ->> 'error') = 'invalid_dietary', 'over-long dietary note is rejected');
select tests.ok((public.submit_rsvp((select v from ctx where k = 'token_claire'), true, 'Claire', 0, null, repeat('a', 1001)) ->> 'error') = 'invalid_message', 'over-long message is rejected');
select tests.ok((public.submit_rsvp((select v from ctx where k = 'token_claire'), true, ' Claire Martin ', 1, 'Végétarienne', 'Hâte d’y être') ->> 'ok')::boolean, 'valid RSVP is accepted');
select tests.ok((public.get_invitation((select v from ctx where k = 'token_claire')) -> 'rsvp' ->> 'respondentName') = 'Claire Martin', 'name is trimmed and RSVP is returned to its guest');
select tests.ok((public.submit_rsvp((select v from ctx where k = 'token_hugo'), false, 'Hugo', 3) ->> 'ok')::boolean, 'declining ignores companions');

-- Organizer reads answers; Bruno still cannot ---------------------------------------
reset role;
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000a"}', false);
select tests.ok((select count(*) from public.rsvps) = 2, 'organizer sees the RSVPs of her event');
select tests.ok((select companions from public.rsvps r join public.guests g on g.id = r.guest_id where g.name = 'Hugo Bernard') = 0, 'declined RSVP stored with 0 companions');
select tests.refused($$update public.rsvps set attending = false$$, 'organizer cannot rewrite a guest answer');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000b"}', false);
select tests.ok((select count(*) from public.rsvps) = 0, 'another organizer sees no RSVPs');

-- Rate limiting (per guest: 10 attempts per hour) ------------------------------------
reset role;
set role anon;
select set_config('request.jwt.claims', '', false);
do $$
declare i int; r jsonb;
begin
  for i in 1..12 loop
    r := public.submit_rsvp((select v from ctx where k = 'token_hugo'), false, 'Hugo');
  end loop;
  perform tests.ok(r ->> 'error' = 'rate_limited', 'repeated submissions are rate limited');
end $$;

-- Rate limiting per IP (token guessing): 30 attempts / 10 min ------------------------
select set_config('request.headers', '{"x-forwarded-for":"203.0.113.7, 10.0.0.1"}', false);
do $$
declare i int; r jsonb;
begin
  for i in 1..31 loop
    r := public.submit_rsvp(md5(i::text) || 'xx', true, 'Bot');
  end loop;
  perform tests.ok(r ->> 'error' = 'rate_limited', 'token guessing from one IP is rate limited');
end $$;
select set_config('request.headers', '', false);

-- Deadline ------------------------------------------------------------------------------
reset role;
update public.events set content = content || '{"rsvpDeadline":"2000-01-01"}' where slug = 'alice-et-sam';
delete from private.rsvp_attempts;
set role anon;
select tests.ok((public.submit_rsvp((select v from ctx where k = 'token_claire'), true, 'Claire') ->> 'error') = 'rsvp_closed', 'RSVPs close after the deadline');

-- Token rotation -------------------------------------------------------------------------
reset role;
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000a"}', false);
select public.regenerate_guest_token(id) from public.guests where name = 'Claire Martin';
reset role;
set role anon;
select tests.ok(public.get_invitation((select v from ctx where k = 'token_claire')) is null, 'old link stops working after rotation');

-- Guest limit -----------------------------------------------------------------------------
reset role;
update public.events set plan = 'essential' where slug = 'alice-et-sam';
insert into public.guests (event_id, name) select (select v::uuid from ctx where k = 'event'), 'Invité ' || g from generate_series(1, 78) g;
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000a"}', false);
select tests.refused(format($$insert into public.guests (event_id, name) values (%L, 'Un de trop')$$, (select v from ctx where k = 'event')), 'guest limit of the plan is enforced');

-- Storage -----------------------------------------------------------------------------------
select tests.refused($$insert into storage.objects (bucket_id, name) values ('memories', 'not-a-uuid/photo.jpg')$$, 'storage refuses paths outside an owned event');
insert into storage.objects (bucket_id, name) values ('memories', (select v from ctx where k = 'event') || '/photo.jpg');
select tests.ok((select count(*) from storage.objects) = 1, 'organizer can store a file in her event folder');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-00000000000b"}', false);
select tests.ok((select count(*) from storage.objects) = 0, 'another organizer cannot list her files');
select tests.refused(format($$insert into storage.objects (bucket_id, name) values ('memories', %L)$$, (select v from ctx where k = 'event') || '/intrus.jpg'), 'another organizer cannot upload into her folder');
reset role;
set role anon;
select tests.ok((select count(*) from storage.objects) = 0, 'anon cannot list files');

reset role;
\echo ALL DATABASE TESTS PASSED
