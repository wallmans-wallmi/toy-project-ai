alter table public.donations add column if not exists terms_accepted boolean not null default false;

comment on column public.donations.terms_accepted is 'אישור תנאי השירות לפני תשלום';
