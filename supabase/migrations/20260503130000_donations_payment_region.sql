-- טבלת תרומות / בקשות איסוף
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  phone text not null,
  address text not null,
  toy_description text,
  pickup_weekday smallint,
  pickup_notes text,
  scheduled_region text not null,
  payment_status boolean not null default false,
  amount_paid integer not null default 0,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  email text,
  door_code text,
  pickup_slot_id text
);

-- עדכון למסד קיים (אם הטבלה כבר נוצרה קודם ללא העמודות)
alter table public.donations add column if not exists scheduled_region text;
alter table public.donations add column if not exists payment_status boolean not null default false;
alter table public.donations add column if not exists amount_paid integer not null default 0;
alter table public.donations add column if not exists pickup_weekday smallint;
alter table public.donations add column if not exists stripe_checkout_session_id text;
alter table public.donations add column if not exists stripe_payment_intent_id text;

alter table public.donations add column if not exists first_name text;
alter table public.donations add column if not exists last_name text;
alter table public.donations add column if not exists phone text;
alter table public.donations add column if not exists address text;
alter table public.donations add column if not exists toy_description text;
alter table public.donations add column if not exists pickup_notes text;
alter table public.donations add column if not exists email text;
alter table public.donations add column if not exists door_code text;
alter table public.donations add column if not exists pickup_slot_id text;

comment on column public.donations.payment_status is 'האם התשלום הושלם בהצלחה';
comment on column public.donations.amount_paid is 'סכום ששולם בשקלים חדשים';
comment on column public.donations.scheduled_region is 'מזהה אזור איסוף (למשל tel_aviv)';

alter table public.donations enable row level security;
