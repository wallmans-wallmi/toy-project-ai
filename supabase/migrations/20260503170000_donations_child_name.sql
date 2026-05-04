alter table public.donations add column if not exists child_name text;

comment on column public.donations.child_name is 'שם הילד או הילדה לצורך התאמת המכתב והתיעוד';

comment on column public.donations.toy_items is 'מערך פריטי תרומה כללי בפורמט JSON כולל שם צבע וגודל צעצוע מוצרים וכו ללא שינוי שם העמודה לתאימות לאחור';
