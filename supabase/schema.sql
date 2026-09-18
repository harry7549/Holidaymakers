-- Roamly Holidays — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses "if not exists" / "or replace" where possible.

-- ============================================================
-- Catalogue tables (public read, admin-only write via /api/admin)
-- ============================================================

create table if not exists destinations (
  id text primary key,
  name text not null,
  country text not null,
  region text not null check (region in ('Domestic', 'International')),
  image text not null,
  tagline text not null,
  description text not null,
  from_price integer not null default 0,
  package_count integer not null default 0,
  rating numeric(2,1) not null default 4.5,
  best_months text not null default '',
  tags jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists suppliers (
  id text primary key,
  name text not null,
  type text not null check (type in ('online', 'offline')),
  location text not null,
  rating numeric(2,1) not null default 4.5,
  packages_count integer not null default 0,
  verified boolean not null default false,
  since integer not null default extract(year from now()),
  specialty text not null default '',
  logo_initial text not null default '',
  color text not null default 'ocean',
  created_at timestamptz not null default now()
);

create table if not exists packages (
  id text primary key,
  slug text unique not null,
  title text not null,
  destination_id text references destinations(id) on delete set null,
  destination_name text not null,
  country text not null,
  region text not null,
  image text not null,
  gallery jsonb not null default '[]',
  category jsonb not null default '[]',
  nights integer not null default 1,
  days integer not null default 2,
  price integer not null default 0,
  original_price integer not null default 0,
  rating numeric(2,1) not null default 4.5,
  reviews_count integer not null default 0,
  group_size_max integer not null default 10,
  difficulty text not null default 'Easy',
  hotel_rating integer not null default 4,
  meal_plan text not null default '',
  transport jsonb not null default '[]',
  tags jsonb not null default '[]',
  highlights jsonb not null default '[]',
  itinerary jsonb not null default '[]',
  inclusions jsonb not null default '[]',
  exclusions jsonb not null default '[]',
  supplier_id text references suppliers(id) on delete set null,
  start_dates jsonb not null default '[]',
  flexible boolean not null default true,
  trending boolean not null default false,
  featured boolean not null default false,
  best_seller boolean not null default false,
  reviews jsonb not null default '[]',
  faqs jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists deals (
  id text primary key,
  title text not null,
  subtitle text not null,
  discount_percent integer not null default 10,
  code text not null,
  expires_at timestamptz not null,
  image text not null,
  package_id text references packages(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Page content (CMS blocks + per-page SEO meta) — public read,
-- admin-only write via /api/admin, same pattern as the catalogue tables.
-- ============================================================

create table if not exists page_blocks (
  id text primary key,
  page text not null,
  type text not null,
  position integer not null default 0,
  visible boolean not null default true,
  content jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists page_blocks_page_idx on page_blocks (page, position);

create table if not exists page_meta (
  id text primary key,
  title text not null default '',
  description text not null default '',
  og_image text not null default '',
  created_at timestamptz not null default now()
);

-- ============================================================
-- Inbound tables (public can insert, only admin can read/update)
-- ============================================================

create table if not exists bookings (
  id text primary key,
  package_id text,
  package_title text not null,
  image text,
  start_date date,
  travelers integer not null default 1,
  add_ons jsonb not null default '[]',
  total_price integer not null default 0,
  status text not null default 'upcoming' check (status in ('upcoming', 'confirmed', 'completed', 'cancelled')),
  traveler_details jsonb not null default '[]',
  contact_email text not null,
  contact_phone text not null,
  created_at timestamptz not null default now()
);

create table if not exists quote_requests (
  id text primary key default gen_random_uuid()::text,
  destinations jsonb not null default '[]',
  days integer not null default 0,
  travelers integer not null default 1,
  budget integer not null default 0,
  style text not null default 'balanced',
  add_ons jsonb not null default '[]',
  name text not null,
  email text not null,
  phone text not null,
  notes text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz not null default now()
);

create table if not exists supplier_applications (
  id uuid primary key default gen_random_uuid(),
  business text not null,
  contact text not null,
  email text not null,
  phone text not null default '',
  city text not null default '',
  type text not null default 'offline' check (type in ('online', 'offline')),
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- CRM: clients (a unified contact record per traveller/lead — online or
-- offline). Fully admin-managed, same access pattern as the inbound tables
-- below (no public insert/read at all, only /api/admin via service role).
-- ============================================================

create table if not exists clients (
  id text primary key default gen_random_uuid()::text,
  full_name text not null,
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  country text not null default '',
  city text not null default '',
  source text not null default 'Manual',
  tags jsonb not null default '[]',
  status text not null default 'active' check (status in ('active', 'dormant', 'lost')),
  notes text not null default '',
  next_follow_up timestamptz,
  last_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_phone_idx on clients (phone);
create index if not exists clients_email_idx on clients (lower(email));

-- ============================================================
-- Row Level Security
-- ============================================================
-- Public (anon) can only ever READ the catalogue tables and INSERT into the
-- inbound tables. Every other operation (catalogue writes, reading/updating
-- inbound tables) happens only through the /api serverless functions using
-- the service-role key, which bypasses RLS entirely — so those tables need
-- no "admin" policy here at all.

alter table destinations enable row level security;
alter table suppliers enable row level security;
alter table packages enable row level security;
alter table deals enable row level security;
alter table page_blocks enable row level security;
alter table page_meta enable row level security;
alter table bookings enable row level security;
alter table quote_requests enable row level security;
alter table contact_messages enable row level security;
alter table supplier_applications enable row level security;
alter table clients enable row level security;

drop policy if exists "public read destinations" on destinations;
create policy "public read destinations" on destinations for select using (true);

drop policy if exists "public read suppliers" on suppliers;
create policy "public read suppliers" on suppliers for select using (true);

drop policy if exists "public read packages" on packages;
create policy "public read packages" on packages for select using (true);

drop policy if exists "public read deals" on deals;
create policy "public read deals" on deals for select using (true);

drop policy if exists "public read page_blocks" on page_blocks;
create policy "public read page_blocks" on page_blocks for select using (true);

drop policy if exists "public read page_meta" on page_meta;
create policy "public read page_meta" on page_meta for select using (true);

-- No policies are created for bookings / quote_requests / contact_messages /
-- supplier_applications / clients: with RLS enabled and zero policies, anon
-- and authenticated roles get NO access at all (not even insert). All writes
-- to these tables happen server-side in /api routes using the service-role key.

-- ============================================================
-- Seed data: after running this file, run `node scripts/seed.mjs` (see
-- README) to load the full demo catalogue (all packages, destinations,
-- suppliers, deals, with reviews and FAQs) from the existing src/data/*.ts
-- files. It's idempotent — safe to re-run.
-- ============================================================
