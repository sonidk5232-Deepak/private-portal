-- Reference schema for public.messages (align with your Supabase table).

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  username text,
  "text" text,
  file_url text,
  deleted_for_everyone_at timestamptz
);

alter table public.messages
  add column if not exists deleted_for_everyone_at timestamptz;

create index if not exists messages_created_at_idx on public.messages (created_at desc);

alter table public.messages enable row level security;

drop policy if exists "messages_select_authenticated" on public.messages;
create policy "messages_select_authenticated"
  on public.messages for select
  to authenticated
  using (true);

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "messages_update_own" on public.messages;
create policy "messages_update_own"
  on public.messages for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Per-user "delete for me" (hide message id for this user only)
create table if not exists public.user_message_hidden (
  user_id uuid not null references auth.users (id) on delete cascade,
  message_id uuid not null references public.messages (id) on delete cascade,
  primary key (user_id, message_id)
);

alter table public.user_message_hidden enable row level security;

drop policy if exists "user_message_hidden_select_own" on public.user_message_hidden;
create policy "user_message_hidden_select_own"
  on public.user_message_hidden for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_message_hidden_insert_own" on public.user_message_hidden;
create policy "user_message_hidden_insert_own"
  on public.user_message_hidden for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_message_hidden_delete_own" on public.user_message_hidden;
create policy "user_message_hidden_delete_own"
  on public.user_message_hidden for delete
  to authenticated
  using (auth.uid() = user_id);

-- Per-user "clear chat" watermark (hide older messages for this user only)
create table if not exists public.user_chat_watermark (
  user_id uuid primary key references auth.users (id) on delete cascade,
  hide_before_at timestamptz not null
);

alter table public.user_chat_watermark enable row level security;

drop policy if exists "user_chat_watermark_select_own" on public.user_chat_watermark;
create policy "user_chat_watermark_select_own"
  on public.user_chat_watermark for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_chat_watermark_insert_own" on public.user_chat_watermark;
create policy "user_chat_watermark_insert_own"
  on public.user_chat_watermark for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_chat_watermark_update_own" on public.user_chat_watermark;
create policy "user_chat_watermark_update_own"
  on public.user_chat_watermark for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "messages_delete_own_recent" on public.messages;
create policy "messages_delete_own_recent"
  on public.messages for delete
  to authenticated
  using (
    auth.uid() = user_id
    and created_at > (now() - interval '24 hours')
  );

-- Last seen / activity (heartbeat from the portal client)
create table if not exists public.user_presence (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text,
  last_seen_at timestamptz not null default now()
);

alter table public.user_presence enable row level security;

drop policy if exists "presence_select_all" on public.user_presence;
create policy "presence_select_all"
  on public.user_presence for select
  to authenticated
  using (true);

drop policy if exists "presence_insert_own" on public.user_presence;
create policy "presence_insert_own"
  on public.user_presence for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "presence_update_own" on public.user_presence;
create policy "presence_update_own"
  on public.user_presence for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_presence'
  ) then
    alter publication supabase_realtime add table public.user_presence;
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do nothing;

drop policy if exists "chat_media_read_authenticated" on storage.objects;
create policy "chat_media_read_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'chat-media');

drop policy if exists "chat_media_insert_own_folder" on storage.objects;
create policy "chat_media_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'chat-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
