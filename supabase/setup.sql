create extension if not exists pgcrypto;

create table if not exists public.apartments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  district text not null,
  price bigint not null check (price >= 0),
  area integer not null check (area > 0),
  bathrooms integer not null default 1 check (bathrooms > 0),
  furnishing text not null default 'Đầy đủ nội thất'
    check (furnishing in ('Đầy đủ nội thất', 'Nội thất cơ bản', 'Không nội thất')),
  description text not null,
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  image_paths text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'available'
    check (status in ('available', 'reserved', 'rented', 'hidden')),
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.apartments enable row level security;

drop policy if exists "Public can view visible apartments" on public.apartments;
create policy "Public can view visible apartments"
on public.apartments for select
using (status <> 'hidden' or auth.role() = 'authenticated');

drop policy if exists "Authenticated admin can insert apartments" on public.apartments;
create policy "Authenticated admin can insert apartments"
on public.apartments for insert
to authenticated
with check (true);

drop policy if exists "Authenticated admin can update apartments" on public.apartments;
create policy "Authenticated admin can update apartments"
on public.apartments for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admin can delete apartments" on public.apartments;
create policy "Authenticated admin can delete apartments"
on public.apartments for delete
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('apartment-images', 'apartment-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view apartment images" on storage.objects;
create policy "Public can view apartment images"
on storage.objects for select
using (bucket_id = 'apartment-images');

drop policy if exists "Authenticated admin can upload apartment images" on storage.objects;
create policy "Authenticated admin can upload apartment images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'apartment-images');

drop policy if exists "Authenticated admin can update apartment images" on storage.objects;
create policy "Authenticated admin can update apartment images"
on storage.objects for update
to authenticated
using (bucket_id = 'apartment-images')
with check (bucket_id = 'apartment-images');

drop policy if exists "Authenticated admin can delete apartment images" on storage.objects;
create policy "Authenticated admin can delete apartment images"
on storage.objects for delete
to authenticated
using (bucket_id = 'apartment-images');

