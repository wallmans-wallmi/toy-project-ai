-- איפוס תיאום איסוף מהאדמין (פריסטים) משתמש ב-null; סכמה ישנה הגדירה NOT NULL
alter table public.donations alter column scheduled_region drop not null;
alter table public.donations alter column scheduled_slot drop not null;
