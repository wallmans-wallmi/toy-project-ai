-- הרצה ב־Supabase SQL Editor (או מיגרציה). קישור לקבלה/חשבונית לפורטל.
alter table public.donations add column if not exists invoice_url text;

comment on column public.donations.invoice_url is 'כתובת URL לקבלה או חשבונית (למשל receipt_url מסטרייפ), לפתיחה באזור האישי';
