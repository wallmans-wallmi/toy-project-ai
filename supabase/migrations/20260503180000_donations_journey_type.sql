alter table public.donations add column if not exists journey_type text;

comment on column public.donations.journey_type is 'מזהה מסלול תרומה או גמילה לקביעת סוג המתנה והמכתב';
