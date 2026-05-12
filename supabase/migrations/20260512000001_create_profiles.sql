-- =============================================================================
-- Migration: Create profiles table with auto-creation trigger
-- Description: Creates a public `profiles` table that is automatically
--              populated whenever a new user registers via Supabase Auth.
--              The trigger copies identity data from auth.users into the
--              public schema so the rest of the app never needs to query
--              the private auth schema directly.
-- =============================================================================


-- ─── 1. Profiles table ────────────────────────────────────────────────────────

create table if not exists public.profiles (
  -- Primary key mirrors auth.users.id — one-to-one relationship
  id            uuid        primary key references auth.users (id) on delete cascade,

  -- Identity fields pulled from auth metadata on signup
  email         text        not null,
  username      text        unique,                        -- chosen later by user
  full_name     text,
  avatar_url    text,

  -- App-specific profile fields
  bio           text,
  is_onboarded  boolean     not null default false,        -- drives onboarding flow

  -- Timestamps
  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now())
);

comment on table public.profiles is
  'Public-facing user profile data. Auto-created by the on_auth_user_created trigger.';


-- ─── 2. Keep updated_at current automatically ─────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();


-- ─── 3. Trigger function — fires after INSERT on auth.users ──────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer                   -- run as the function owner, not the caller
set search_path = public           -- prevent search-path hijacking
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    -- raw_user_meta_data is populated by OAuth providers and the
    -- signUp({ options: { data: { full_name: '...' } } }) call
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  )
  on conflict (id) do nothing;     -- idempotent: safe if trigger fires twice

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates a matching public.profiles row whenever a new auth.users row is inserted.';


-- ─── 4. Bind the trigger to auth.users ───────────────────────────────────────

-- Drop first so this migration is re-runnable
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ─── 5. Row Level Security ───────────────────────────────────────────────────

alter table public.profiles enable row level security;

-- Anyone (including anon) can read any profile — needed for public collection pages
create policy "Profiles are publicly viewable."
  on public.profiles
  for select
  using (true);

-- A user can only insert their own profile row (edge case: manual insert)
create policy "Users can insert their own profile."
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- A user can only update their own profile
create policy "Users can update their own profile."
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- A user cannot delete their own profile (cascade from auth.users handles cleanup)
-- To allow self-deletion, add a delete policy here.


-- ─── 6. Foreign key: portfolios & alerts already reference auth.users ────────
--
-- No changes needed to the existing tables — they join profiles via:
--   portfolios.user_id  = profiles.id
--   alerts.user_id      = profiles.id
--
-- Useful join pattern:
--   select p.*, pr.username, pr.avatar_url
--   from portfolios p
--   join public.profiles pr on pr.id = p.user_id
--   where p.user_id = auth.uid();
