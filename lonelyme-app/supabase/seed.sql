-- Sandbox seed data: test users for matching
-- Passwords not needed (magic link auth). Users created via auth.users insert.
-- Run after `supabase db reset` or apply manually in SQL editor.

-- Test user: Maria (Spain)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'maria@lonelyme.test',
  crypt('sandbox123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"maria_es","display_name":"Maria","timezone":"Europe/Madrid"}',
  now(), now(), '', ''
) on conflict (id) do nothing;

insert into public.profiles (id, username, display_name, bio, interests, languages, timezone)
values (
  '11111111-1111-1111-1111-111111111111',
  'maria_es', 'Maria',
  'Love learning about other cultures!',
  array['Travel', 'Music', 'Cooking'],
  array['Spanish', 'English'],
  'Europe/Madrid'
) on conflict (id) do update set
  interests = excluded.interests,
  languages = excluded.languages,
  timezone = excluded.timezone;

insert into public.token_balances (user_id, balance)
values ('11111111-1111-1111-1111-111111111111', 100)
on conflict (user_id) do nothing;

-- Test user: Kenji (Japan)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'kenji@lonelyme.test',
  crypt('sandbox123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"kenji_jp","display_name":"Kenji","timezone":"Asia/Tokyo"}',
  now(), now(), '', ''
) on conflict (id) do nothing;

insert into public.profiles (id, username, display_name, bio, interests, languages, timezone)
values (
  '22222222-2222-2222-2222-222222222222',
  'kenji_jp', 'Kenji',
  'Looking for language exchange friends.',
  array['Gaming', 'Technology', 'Languages'],
  array['Japanese', 'English'],
  'Asia/Tokyo'
) on conflict (id) do update set
  interests = excluded.interests,
  languages = excluded.languages,
  timezone = excluded.timezone;

insert into public.token_balances (user_id, balance)
values ('22222222-2222-2222-2222-222222222222', 100)
on conflict (user_id) do nothing;

-- Test user: Amara (Nigeria)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'amara@lonelyme.test',
  crypt('sandbox123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"amara_ng","display_name":"Amara","timezone":"Africa/Lagos"}',
  now(), now(), '', ''
) on conflict (id) do nothing;

insert into public.profiles (id, username, display_name, bio, interests, languages, timezone)
values (
  '33333333-3333-3333-3333-333333333333',
  'amara_ng', 'Amara',
  'Passionate about books and photography.',
  array['Books', 'Photography', 'Art'],
  array['English', 'French'],
  'Africa/Lagos'
) on conflict (id) do update set
  interests = excluded.interests,
  languages = excluded.languages,
  timezone = excluded.timezone;

insert into public.token_balances (user_id, balance)
values ('33333333-3333-3333-3333-333333333333', 100)
on conflict (user_id) do nothing;

-- Test user: Lucas (Brazil)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token
) values (
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'lucas@lonelyme.test',
  crypt('sandbox123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"lucas_br","display_name":"Lucas","timezone":"America/Sao_Paulo"}',
  now(), now(), '', ''
) on conflict (id) do nothing;

insert into public.profiles (id, username, display_name, bio, interests, languages, timezone)
values (
  '44444444-4444-4444-4444-444444444444',
  'lucas_br', 'Lucas',
  'Football fan, love meeting people worldwide.',
  array['Sports', 'Music', 'Travel'],
  array['Portuguese', 'English', 'Spanish'],
  'America/Sao_Paulo'
) on conflict (id) do update set
  interests = excluded.interests,
  languages = excluded.languages,
  timezone = excluded.timezone;

insert into public.token_balances (user_id, balance)
values ('44444444-4444-4444-4444-444444444444', 100)
on conflict (user_id) do nothing;
