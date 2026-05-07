-- העדפות פורטל לקוח (התראות ושפת ממשק)
alter table public.customer_profiles add column if not exists notify_sms boolean not null default true;
alter table public.customer_profiles add column if not exists notify_email boolean not null default true;
alter table public.customer_profiles add column if not exists ui_locale text not null default 'he';

comment on column public.customer_profiles.notify_sms is 'הסכמה לקבלת עדכונים ב־SMS';
comment on column public.customer_profiles.notify_email is 'הסכמה לקבלת עדכונים במייל';
comment on column public.customer_profiles.ui_locale is 'קוד שפה לממשק (he | en)';
