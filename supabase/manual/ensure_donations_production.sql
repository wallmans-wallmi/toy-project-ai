-- =============================================================================
-- donations — יישור פרודקשן למיגרציות המקומיות (idempotent)
-- הריצו ב-Supabase SQL Editor אם מופיע PGRST204 / "column not found in schema cache"
-- אחרי הריצה: גם ב-Dashboard → Settings → API → Reload schema (אם NOTIFY לא מספיק)
-- =============================================================================

-- עמודות בסיס / אזור / תשלום
alter table public.donations add column if not exists scheduled_region text;
alter table public.donations add column if not exists scheduled_slot text;
alter table public.donations add column if not exists pickup_weekday smallint;
alter table public.donations add column if not exists pickup_slot_id text;
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

-- פריטים, אישורים, מסלול, ילד
alter table public.donations add column if not exists toy_items jsonb not null default '[]'::jsonb;
alter table public.donations add column if not exists toys_quality_confirmed boolean not null default false;
alter table public.donations add column if not exists terms_accepted boolean not null default false;
alter table public.donations add column if not exists child_name text;
alter table public.donations add column if not exists journey_type text;

-- מכתב AI + יעד (נדרש ל־/api/checkout + lib/donation-letter)
alter table public.donations add column if not exists ai_generated_letter text;
alter table public.donations add column if not exists letter_status text not null default 'pending';
alter table public.donations add column if not exists destination_name text;
alter table public.donations add column if not exists pickup_city text;

-- payment_status כטקסט: אם חסר לגמרי
alter table public.donations add column if not exists payment_status text not null default 'pending';

-- אם עדיין boolean — המרה ל־pending | completed (מיגרציה 20260504110000)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'donations'
      and column_name = 'payment_status'
      and udt_name = 'bool'
  ) then
    alter table public.donations alter column payment_status drop default;
    alter table public.donations
      alter column payment_status type text
      using (case when payment_status then 'completed' else 'pending' end);
    alter table public.donations alter column payment_status set default 'pending';
    alter table public.donations alter column payment_status set not null;
  end if;
end $$;

alter table public.donations add column if not exists amount_paid integer not null default 0;

comment on column public.donations.payment_status is 'מחזור חיים: pending | completed (תשלום הושלם)';
comment on column public.donations.letter_status is 'מצב יצירת המכתב: pending | completed | failed';
comment on column public.donations.ai_generated_letter is 'טקסט מכתב חם שנוצר ב-AI לילד המקבל';
comment on column public.donations.destination_name is 'שם המקום שאליו הוצאו הצעצועים — מילוי אדמין; nullable';
comment on column public.donations.pickup_city is 'עיר לאיסוף — שיווק / לידים';

notify pgrst, 'reload schema';
