-- מכתב AI לילד המקבל
alter table public.donations add column if not exists ai_generated_letter text;
alter table public.donations add column if not exists letter_status text not null default 'pending';

comment on column public.donations.ai_generated_letter is 'טקסט מכתב חם שנוצר ב-AI לילד המקבל';
comment on column public.donations.letter_status is 'מצב יצירת המכתב: pending | completed | failed';
