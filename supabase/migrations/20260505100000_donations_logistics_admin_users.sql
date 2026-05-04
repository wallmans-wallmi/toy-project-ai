-- לוגיסטיקה: איסוף, סטטוסים, ארגון יעד
alter table public.donations add column if not exists pickup_date date;
alter table public.donations add column if not exists pickup_time time;
alter table public.donations add column if not exists pickup_address text;

alter table public.donations add column if not exists pickup_status text;
alter table public.donations add column if not exists delivery_status text;

update public.donations set pickup_status = 'pending' where pickup_status is null;
update public.donations set delivery_status = 'at_warehouse' where delivery_status is null;

alter table public.donations alter column pickup_status set default 'pending';
alter table public.donations alter column delivery_status set default 'at_warehouse';

alter table public.donations alter column pickup_status set not null;
alter table public.donations alter column delivery_status set not null;

alter table public.donations drop constraint if exists donations_pickup_status_check;
alter table public.donations add constraint donations_pickup_status_check
  check (pickup_status in ('pending', 'picked_up', 'failed'));

alter table public.donations drop constraint if exists donations_delivery_status_check;
alter table public.donations add constraint donations_delivery_status_check
  check (delivery_status in ('at_warehouse', 'sent_to_ngo', 'delivered'));

alter table public.donations add column if not exists target_ngo_name text;
alter table public.donations add column if not exists target_ngo_city text;
alter table public.donations add column if not exists delivery_time timestamptz;

comment on column public.donations.pickup_date is 'תאריך איסוף מתוכנן';
comment on column public.donations.pickup_time is 'שעת איסוף מתוכננת';
comment on column public.donations.pickup_address is 'כתובת איסוף מפורטת לצוות';
comment on column public.donations.pickup_status is 'pending | picked_up | failed';
comment on column public.donations.delivery_status is 'at_warehouse | sent_to_ngo | delivered';
comment on column public.donations.target_ngo_name is 'שם ארגון היעד לתרומה';
comment on column public.donations.target_ngo_city is 'עיר ארגון היעד';
comment on column public.donations.delivery_time is 'מועד הגעה/מסירה בפועל';

-- משתמשי ניהול מרובים
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null,
  password_hash text not null,
  role text not null default 'admin'
);

create unique index if not exists admin_users_email_lower_idx on public.admin_users (lower(email));

alter table public.admin_users drop constraint if exists admin_users_role_check;
alter table public.admin_users add constraint admin_users_role_check
  check (role in ('admin', 'superadmin'));

alter table public.admin_users enable row level security;
