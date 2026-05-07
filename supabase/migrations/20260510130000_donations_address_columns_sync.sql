-- =============================================================================
-- Align donations address / notes / NGO columns with app usage (Nifradim).
-- Idempotent: ADD COLUMN IF NOT EXISTS + backfill + documentation comments.
-- =============================================================================

-- Structured address from checkout (mirrors customer_profiles naming).
alter table public.donations
  add column if not exists street_name text,
  add column if not exists house_number text,
  add column if not exists apartment_number text,
  add column if not exists floor text;

-- Customer gate / entrance notes (טופס "הערות לכתובת"), separate from kit packing line.
alter table public.donations
  add column if not exists address_notes text;

comment on column public.donations.address is
  'שורת כתובת לאיסוף כפי שנשלחה מהטופס (רחוב+בית+דירה+קומה). נשמרת לצורכי תאימות לאחור ולתצוגה מהירה';

comment on column public.donations.pickup_address is
  'שורת כתובת לאיסוף ללוגיסטיקה ואדמין (מסונכן עם address בבקשות חדשות; עדיפות לעריכה בממשק אדמין)';

comment on column public.donations.pickup_location is
  'מיקום איסוף טקסטואלי / legacy: מסונכן מ־pickup_address או address כשהשדה ריק';

comment on column public.donations.pickup_notes is
  'הערות תפעול בלבד: שורת ערכות אריזה ושמות ילדים (לא הערות לקוח לכתובת)';

comment on column public.donations.address_notes is
  'הערות לקוח לכתובת (קוד שער, הוראות הגעה), כפי שמולא בטופס';

comment on column public.donations.street_name is 'שם רחוב נפרד מהטופס (פורטל / סנכרון)';
comment on column public.donations.house_number is 'מספר בית';
comment on column public.donations.apartment_number is 'מספר דירה';
comment on column public.donations.floor is 'קומה';

comment on column public.donations.target_ngo_name is 'שם עמותת יעד קנוני (נערך מאדמין לוגיסטיקה)';
comment on column public.donations.ngo_name is
  'שדה legacy לתצוגה ישנה: מומלץ לשמור מסונכן עם target_ngo_name';

comment on column public.customer_profiles.street_name is
  'שם רחוב לפרופיל פורטל; מתמלא מסנכרון מתרומה (שדות מפורקים או שורת address כגיבוי)';

-- Backfill: logistics column was often empty while address held the line from checkout.
update public.donations d
set pickup_address = nullif(trim(both from d.address), '')
where (d.pickup_address is null or trim(both from d.pickup_address) = '')
  and d.address is not null
  and trim(both from d.address) <> '';

-- Backfill: legacy pickup_location used in some admin views.
update public.donations d
set pickup_location = nullif(
    trim(both from coalesce(nullif(trim(both from d.pickup_address), ''), nullif(trim(both from d.address), ''))),
    ''
  )
where (d.pickup_location is null or trim(both from d.pickup_location) = '')
  and coalesce(nullif(trim(both from d.pickup_address), ''), nullif(trim(both from d.address), '')) is not null;

-- Backfill: keep legacy ngo_name in sync with canonical target_ngo_name when empty.
update public.donations d
set ngo_name = trim(both from d.target_ngo_name)
where (d.ngo_name is null or trim(both from d.ngo_name) = '')
  and d.target_ngo_name is not null
  and trim(both from d.target_ngo_name) <> '';
