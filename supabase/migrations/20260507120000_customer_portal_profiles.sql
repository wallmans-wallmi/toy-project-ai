-- פורטל לקוחות: פרופיל, קישור לתרומות, ו־RLS
create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  phone text not null,
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  street_name text not null default '',
  house_number text not null default '',
  apartment_number text not null default '',
  floor text not null default '',
  door_code text not null default '',
  address_notes text not null default '',
  pickup_city text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.customer_profiles is 'פרטי לקוח לפורטל אחרי התחברות עם טלפון';
comment on column public.customer_profiles.phone is 'מספר טלפון כפי שמופיע ב־Auth (מומלץ E.164)';

alter table public.customer_profiles enable row level security;

drop policy if exists "portal_select_own_profile" on public.customer_profiles;
create policy "portal_select_own_profile" on public.customer_profiles for select to authenticated using (user_id = auth.uid());

drop policy if exists "portal_insert_own_profile" on public.customer_profiles;
create policy "portal_insert_own_profile" on public.customer_profiles for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "portal_update_own_profile" on public.customer_profiles;
create policy "portal_update_own_profile" on public.customer_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "portal_delete_own_profile" on public.customer_profiles;
create policy "portal_delete_own_profile" on public.customer_profiles for delete to authenticated using (user_id = auth.uid());

alter table public.donations add column if not exists customer_user_id uuid references auth.users (id) on delete set null;

create index if not exists donations_customer_user_id_idx on public.donations (customer_user_id);

drop policy if exists "portal_read_own_donations" on public.donations;
create policy "portal_read_own_donations" on public.donations for select to authenticated using (
  customer_user_id is not null
  and customer_user_id = auth.uid()
);
