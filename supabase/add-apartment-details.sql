alter table public.apartments
  add column if not exists bathrooms integer not null default 1
    check (bathrooms > 0),
  add column if not exists furnishing text not null default 'Đầy đủ nội thất'
    check (furnishing in ('Đầy đủ nội thất', 'Nội thất cơ bản', 'Không nội thất'));
