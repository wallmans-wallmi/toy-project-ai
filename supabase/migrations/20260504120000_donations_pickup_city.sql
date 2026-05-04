-- עיר לאיסוף (שיווק / סגמנטציה) — נפרדת ממחרוזת הכתובת המלאה
alter table public.donations add column if not exists pickup_city text;

comment on column public.donations.pickup_city is 'עיר שנבחרה בטופס האיסוף — לידים ושיווק';
