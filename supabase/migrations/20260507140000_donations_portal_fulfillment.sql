-- שלבי פורטל לקוח: בר התקדמות ותיאום איסוף אחרי מסירת ערכה
alter table public.donations add column if not exists portal_fulfillment_stage text not null default 'request_received';

alter table public.donations add column if not exists portal_kit_delivered_sms_at timestamptz;

alter table public.donations drop constraint if exists donations_portal_fulfillment_stage_check;

alter table public.donations add constraint donations_portal_fulfillment_stage_check check (
  portal_fulfillment_stage in (
    'request_received',
    'kit_in_transit',
    'kit_delivered',
    'pickup_scheduled',
    'courier_en_route',
    'collected',
    'donated'
  )
);

comment on column public.donations.portal_fulfillment_stage is 'צינור פורטל לקוח: בקשה → ערכה בדרך → הגיעה → תיאום איסוף → שליח → נאסף → נתרם';
comment on column public.donations.portal_kit_delivered_sms_at is 'מועד סימולציה/שליחת SMS לתיאום איסוף אחרי שהערכה הגיעה';
