-- Mid-funnel leads vs full checkout rows (admin lists)
alter table public.donations
  add column if not exists funnel_stage text not null default 'ordered';

alter table public.donations drop constraint if exists donations_funnel_stage_check;

alter table public.donations add constraint donations_funnel_stage_check check (
  funnel_stage in ('potential', 'ordered')
);

comment on column public.donations.funnel_stage is
  'potential: נשמר בטיוטה אחרי מילוי פרטים והמשך ללא תשלום. ordered: נרשם בצ׳קאאוט מלא (מסך תשלום)';

update public.donations set funnel_stage = 'ordered' where funnel_stage is null or funnel_stage = '';

notify pgrst, 'reload schema';
