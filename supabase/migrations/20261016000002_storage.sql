-- =============================================================================
-- VOW. — private storage for future "Memories" uploads (architecture only in
-- MVP 1.0: no upload UI ships yet).
--
-- Layout: memories/<event_id>/<file>. The bucket is private. Organizers manage
-- the files of their own events. Guests will get time-limited signed URLs that a
-- server function issues after checking their token (to be built with the upload
-- feature).
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('memories', 'memories', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

-- Safe ownership check on the first path segment (never throws on bad names).
create or replace function private.owns_event_folder(p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_folder text := (storage.foldername(p_name))[1];
begin
  if v_folder is null or v_folder !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  return private.owns_event(v_folder::uuid);
end
$$;
revoke all on function private.owns_event_folder(text) from public, anon;
grant execute on function private.owns_event_folder(text) to authenticated;

create policy memories_owner_select on storage.objects for select to authenticated
  using (bucket_id = 'memories' and private.owns_event_folder(name));

create policy memories_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'memories' and private.owns_event_folder(name));

create policy memories_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'memories' and private.owns_event_folder(name))
  with check (bucket_id = 'memories' and private.owns_event_folder(name));

create policy memories_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'memories' and private.owns_event_folder(name));
