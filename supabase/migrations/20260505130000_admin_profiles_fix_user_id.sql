-- תיקון: טבלת admin_profiles קיימת בלי user_id (סכימה ישנה / הרצה חלקית)
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'admin_profiles'
  )
  and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'admin_profiles'
      and column_name = 'user_id'
  ) then
    execute 'drop table public.admin_profiles cascade';
  end if;
end $$;

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.admin_users (id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.admin_profiles drop constraint if exists admin_profiles_role_check;
alter table public.admin_profiles add constraint admin_profiles_role_check
  check (role in ('admin', 'office', 'driver'));

alter table public.admin_profiles enable row level security;

comment on table public.admin_profiles is 'תפקיד לוגיסטיקה: admin | office | driver';

insert into public.admin_profiles (user_id, role)
select au.id, 'admin'::text
from public.admin_users au
where not exists (select 1 from public.admin_profiles p where p.user_id = au.id);
