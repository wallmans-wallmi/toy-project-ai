-- איפוס תיאום מהאדמין: פריסטים יכולים לאפס pickup_slot_id
alter table public.donations alter column pickup_slot_id drop not null;
