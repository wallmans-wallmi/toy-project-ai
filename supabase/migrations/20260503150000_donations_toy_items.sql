alter table public.donations add column if not exists toy_items jsonb not null default '[]'::jsonb;
alter table public.donations add column if not exists toys_quality_confirmed boolean not null default false;

comment on column public.donations.toy_items is 'מערך פריטי צעצוע שמורים כ־JSON';
comment on column public.donations.toys_quality_confirmed is 'אישור התורם למצב תקין של הצעצועים';
