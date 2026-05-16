-- Profiles table
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- My List / Watchlist
create table if not exists public.watchlist (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  media_id integer not null,
  media_type text check (media_type in ('movie', 'tv')) not null,
  title text not null,
  poster_path text,
  added_at timestamptz default now() not null,
  unique(profile_id, media_id, media_type)
);

-- Watch Progress / Continue Watching
create table if not exists public.watch_progress (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  media_id integer not null,
  media_type text check (media_type in ('movie', 'tv')) not null,
  title text not null,
  poster_path text,
  progress real default 0 not null,
  duration real default 0 not null,
  season_number integer,
  episode_number integer,
  updated_at timestamptz default now() not null,
  unique(profile_id, media_id, media_type)
);

-- Watch History
create table if not exists public.watch_history (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  media_id integer not null,
  media_type text check (media_type in ('movie', 'tv')) not null,
  title text not null,
  poster_path text,
  watched_at timestamptz default now() not null
);

-- User Ratings (1-10)
create table if not exists public.ratings (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  media_id integer not null,
  media_type text check (media_type in ('movie', 'tv')) not null,
  rating integer check (rating >= 1 and rating <= 10) not null,
  created_at timestamptz default now() not null,
  unique(profile_id, media_id, media_type)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.watchlist enable row level security;
alter table public.watch_progress enable row level security;
alter table public.watch_history enable row level security;
alter table public.ratings enable row level security;

-- Profiles RLS
create policy "Users can view own profiles" on public.profiles
  for select using (auth.uid() = account_id);
create policy "Users can create own profiles" on public.profiles
  for insert with check (auth.uid() = account_id);
create policy "Users can update own profiles" on public.profiles
  for update using (auth.uid() = account_id);
create policy "Users can delete own profiles" on public.profiles
  for delete using (auth.uid() = account_id);

-- Watchlist RLS
create policy "Users can manage own watchlist" on public.watchlist
  for all using (
    profile_id in (select id from public.profiles where account_id = auth.uid())
  );

-- Watch Progress RLS
create policy "Users can manage own progress" on public.watch_progress
  for all using (
    profile_id in (select id from public.profiles where account_id = auth.uid())
  );

-- Watch History RLS
create policy "Users can manage own history" on public.watch_history
  for all using (
    profile_id in (select id from public.profiles where account_id = auth.uid())
  );

-- Ratings RLS
create policy "Users can manage own ratings" on public.ratings
  for all using (
    profile_id in (select id from public.profiles where account_id = auth.uid())
  );

-- Indexes
create index if not exists idx_profiles_account on public.profiles(account_id);
create index if not exists idx_watchlist_profile on public.watchlist(profile_id);
create index if not exists idx_progress_profile on public.watch_progress(profile_id);
create index if not exists idx_history_profile on public.watch_history(profile_id);
create index if not exists idx_ratings_profile on public.ratings(profile_id);
