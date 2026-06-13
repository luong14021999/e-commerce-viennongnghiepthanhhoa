-- ============================================================
-- Kết nối Cung – Cầu nông sản Thanh Hóa
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

create table if not exists public.market_posts (
  id                 uuid default uuid_generate_v4() primary key,
  user_id            uuid references public.profiles on delete cascade not null,
  type               text not null check (type in ('cung', 'cau')),
  category           text not null,
  title              text not null,
  description        text not null default '',
  quantity_value     numeric,
  quantity_unit      text default 'kg',
  price_value        numeric,
  price_unit         text,
  price_negotiable   boolean not null default false,
  location           text not null default '',
  contact_name       text not null,
  contact_phone      text not null,
  contact_email      text,
  valid_until        date,
  status             text not null default 'active'
                       check (status in ('active', 'closed', 'expired')),
  views              integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_market_posts_status      on public.market_posts(status);
create index if not exists idx_market_posts_type        on public.market_posts(type);
create index if not exists idx_market_posts_category    on public.market_posts(category);
create index if not exists idx_market_posts_created_at  on public.market_posts(created_at desc);

-- RLS
alter table public.market_posts enable row level security;

-- Active posts public; owner sees own (any status); admin sees all
create policy "market_posts_select" on public.market_posts for select using (
  status = 'active'
  or user_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Authenticated users can post as themselves
create policy "market_posts_insert" on public.market_posts for insert with check (
  user_id = auth.uid()
);

-- Owner / admin can update
create policy "market_posts_update" on public.market_posts for update using (
  user_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Owner / admin can delete
create policy "market_posts_delete" on public.market_posts for delete using (
  user_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Auto-update updated_at
create or replace function public.market_posts_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists market_posts_updated_at on public.market_posts;
create trigger market_posts_updated_at
  before update on public.market_posts
  for each row execute function public.market_posts_set_updated_at();

-- Enable realtime
alter publication supabase_realtime add table public.market_posts;
