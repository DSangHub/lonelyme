-- LonelyMe core schema for Supabase

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  display_name text,
  bio text default '',
  interests text[] default '{}',
  languages text[] default '{English}',
  avatar_url text,
  is_available boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.token_balances (
  user_id uuid references auth.users on delete cascade primary key,
  balance integer default 50 not null check (balance >= 0),
  updated_at timestamptz default now()
);

create table if not exists public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  amount integer not null,
  type text not null check (type in ('purchase', 'spend', 'bonus')),
  description text,
  stripe_session_id text unique,
  created_at timestamptz default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid references auth.users on delete cascade not null,
  user2_id uuid references auth.users on delete cascade not null,
  status text default 'active' check (status in ('active', 'ended')),
  created_at timestamptz default now(),
  unique (user1_id, user2_id),
  check (user1_id < user2_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches on delete cascade not null unique,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations on delete cascade not null,
  sender_id uuid references auth.users on delete cascade not null,
  content text not null,
  translated_content text,
  target_language text,
  moderation_status text default 'approved' check (moderation_status in ('approved', 'flagged', 'blocked')),
  moderation_reason text,
  created_at timestamptz default now()
);

create index if not exists messages_conversation_id_idx on public.messages (conversation_id, created_at);

alter table public.profiles enable row level security;
alter table public.token_balances enable row level security;
alter table public.token_transactions enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "Users can view own token balance"
  on public.token_balances for select to authenticated using (auth.uid() = user_id);

create policy "Users can view own transactions"
  on public.token_transactions for select to authenticated using (auth.uid() = user_id);

create policy "Users can view own matches"
  on public.matches for select to authenticated
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Users can view conversations for their matches"
  on public.conversations for select to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

create policy "Users can view messages in their conversations"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      join public.matches m on m.id = c.match_id
      where c.id = conversation_id and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

create policy "Users can send messages in their conversations"
  on public.messages for insert to authenticated
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversations c
      join public.matches m on m.id = c.match_id
      where c.id = conversation_id and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

-- Auto-create profile + starter tokens on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  insert into public.token_balances (user_id, balance) values (new.id, 50);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;
