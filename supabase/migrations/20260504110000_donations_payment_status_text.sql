-- מעבר מ־boolean לטקסט: pending (עגלה נטושה / לפני תשלום) ↔ completed (אחרי תשלום)
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

comment on column public.donations.payment_status is 'מחזור חיים: pending | completed (תשלום הושלם)';
