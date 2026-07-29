-- Saigon Retreats: customer accounts, favorites, and role-separated security.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  apartment_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, apartment_id)
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(coalesce(nullif(new.raw_user_meta_data->>'username', ''), 'user_' || substr(new.id::text, 1, 8))),
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(coalesce(new.email, 'Khách hàng'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, username, display_name, role)
select id, 'admin_' || substr(id::text, 1, 8), 'Saigon Retreats Admin', 'admin'
from auth.users
where lower(email) = 'nguyenthucnamkhoa3110@gmail.com'
on conflict (id) do update set role = 'admin';

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (username, display_name, updated_at) on public.profiles to authenticated;

drop policy if exists "Users manage own favorites" on public.favorites;
create policy "Users manage own favorites" on public.favorites
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Authenticated admin can insert apartments" on public.apartments;
drop policy if exists "Authenticated admin can update apartments" on public.apartments;
drop policy if exists "Authenticated admin can delete apartments" on public.apartments;

create policy "Admins can insert apartments" on public.apartments
for insert to authenticated with check (public.is_admin());
create policy "Admins can update apartments" on public.apartments
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete apartments" on public.apartments
for delete to authenticated using (public.is_admin());

drop policy if exists "Authenticated admin can upload apartment images" on storage.objects;
drop policy if exists "Authenticated admin can update apartment images" on storage.objects;
drop policy if exists "Authenticated admin can delete apartment images" on storage.objects;

create policy "Admins can upload apartment images" on storage.objects
for insert to authenticated with check (bucket_id = 'apartment-images' and public.is_admin());
create policy "Admins can update apartment images" on storage.objects
for update to authenticated using (bucket_id = 'apartment-images' and public.is_admin())
with check (bucket_id = 'apartment-images' and public.is_admin());
create policy "Admins can delete apartment images" on storage.objects
for delete to authenticated using (bucket_id = 'apartment-images' and public.is_admin());
