-- הרצה ב־Supabase SQL Editor אם חסרה העמודה (מתקן 500 ב־GET /api/admin/donations).
-- מספר הזמנה אנושי (לתצוגה וחיפוש). UUID נשאר המפתח הראשי.

alter table public.donations add column if not exists order_number bigint;

update public.donations d
set order_number = sub.no
from (
  select id, 1000 + row_number() over (order by created_at asc) as no
  from public.donations
  where order_number is null
) sub
where d.id = sub.id;

alter table public.donations alter column order_number set not null;

create unique index if not exists donations_order_number_key on public.donations (order_number);

create sequence if not exists public.donations_order_number_seq;

select setval(
  'public.donations_order_number_seq',
  coalesce((select max(order_number) from public.donations), 1000)
);

alter table public.donations
  alter column order_number set default nextval('public.donations_order_number_seq');

alter sequence public.donations_order_number_seq owned by public.donations.order_number;

comment on column public.donations.order_number is 'מספר הזמנה לתצוגה וחיפוש (סידורי, מתחיל ב־1001). UUID נשאר מזהה טכני.';
