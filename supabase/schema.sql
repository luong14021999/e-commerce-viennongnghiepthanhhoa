-- ============================================================
-- Viện Nông Nghiệp Thanh Hóa — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── TABLES ───────────────────────────────────────────────────────────────

create table public.profiles (
  id       uuid references auth.users on delete cascade primary key,
  name     text not null default '',
  phone    text unique not null default '',
  email    text,
  address  text,
  role     text not null default 'buyer'
             check (role in ('buyer', 'business', 'admin')),
  created_at timestamptz not null default now()
);

create table public.business_profiles (
  id               uuid references public.profiles on delete cascade primary key,
  business_name    text not null default '',
  tax_code         text not null default '',
  business_address text not null default '',
  category         text not null default '',
  description      text,
  verified         boolean not null default false,
  created_at       timestamptz not null default now()
);

create table public.products (
  id               uuid default uuid_generate_v4() primary key,
  name             text not null,
  category         text not null,
  type             text not null default 'product'
                     check (type in ('product', 'service')),
  price            numeric not null default 0,
  original_price   numeric not null default 0,
  unit             text not null default 'kg',
  icon             text not null default '🌾',
  bg               text not null default 'bg-green-50',
  tag              text,
  tag_color        text,
  rating           numeric not null default 0,
  reviews          integer not null default 0,
  sold             integer not null default 0,
  description      text not null default '',
  specs            jsonb not null default '[]',
  origin           text not null default '',
  certifications   jsonb not null default '[]',
  seller_id        uuid references public.profiles on delete set null,
  seller_name      text,
  status           text not null default 'pending'
                     check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  submitted_at     timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

create table public.product_images (
  id         uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products on delete cascade not null,
  url        text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.orders (
  id               uuid default uuid_generate_v4() primary key,
  buyer_id         uuid references public.profiles on delete set null,
  status           text not null default 'pending'
                     check (status in ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled')),
  shipping_name    text not null,
  shipping_phone   text not null,
  shipping_address text not null,
  note             text,
  total_price      numeric not null,
  shipping_fee     numeric not null default 0,
  grand_total      numeric not null,
  payment_method   text not null default 'cod',
  created_at       timestamptz not null default now()
);

create table public.order_items (
  id                uuid default uuid_generate_v4() primary key,
  order_id          uuid references public.orders on delete cascade not null,
  product_id        uuid,
  product_name      text not null,
  product_price     numeric not null,
  product_unit      text not null default 'kg',
  product_icon      text,
  product_image_url text,
  quantity          integer not null,
  subtotal          numeric not null
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────

alter table public.profiles         enable row level security;
alter table public.business_profiles enable row level security;
alter table public.products          enable row level security;
alter table public.product_images    enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;

-- profiles: public read, own write
create policy "profiles_select"  on public.profiles for select using (true);
create policy "profiles_insert"  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update"  on public.profiles for update using (auth.uid() = id);

-- business_profiles: public read, own write
create policy "biz_select"  on public.business_profiles for select using (true);
create policy "biz_insert"  on public.business_profiles for insert with check (auth.uid() = id);
create policy "biz_update"  on public.business_profiles for update using (auth.uid() = id);

-- products: approved are public; seller sees own; admin sees all
create policy "products_select" on public.products for select using (
  status = 'approved'
  or seller_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "products_insert" on public.products for insert with check (
  seller_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "products_update" on public.products for update using (
  seller_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "products_delete" on public.products for delete using (
  seller_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- product_images: public read, seller/admin write
create policy "product_images_select" on public.product_images for select using (true);
create policy "product_images_insert" on public.product_images for insert with check (
  exists (
    select 1 from public.products p where p.id = product_id
    and (p.seller_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  )
);
create policy "product_images_delete" on public.product_images for delete using (
  exists (
    select 1 from public.products p where p.id = product_id
    and (p.seller_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  )
);

-- orders: buyer sees own, admin sees all
create policy "orders_select" on public.orders for select using (
  buyer_id = auth.uid()
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "orders_insert" on public.orders for insert with check (buyer_id = auth.uid());
create policy "orders_update" on public.orders for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- order_items: follow parent order
create policy "order_items_select" on public.order_items for select using (
  exists (
    select 1 from public.orders o where o.id = order_id
    and (o.buyer_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  )
);
create policy "order_items_insert" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
);

-- ─── TRIGGER: auto-create profile on sign-up ─────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'email', ''),
    coalesce(new.raw_user_meta_data->>'role', 'buyer')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── STORAGE BUCKET (run separately in Storage → New bucket) ────────────
-- Name: product-images
-- Public bucket: YES
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
