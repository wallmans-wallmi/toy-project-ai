-- קישור לקבלה/חשבונית מסטרייפ (תצוגה בפורטל). אופציונלי עד לאחר תשלום.
alter table public.donations add column if not exists invoice_url text;

comment on column public.donations.invoice_url is 'כתובת URL לקבלה או חשבונית (למשל receipt_url מסטרייפ), לפתיחה באזור האישי';
