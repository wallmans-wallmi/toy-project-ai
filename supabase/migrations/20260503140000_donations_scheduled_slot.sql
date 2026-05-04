alter table public.donations add column if not exists scheduled_slot text;

comment on column public.donations.scheduled_slot is 'תווית חלון זמן לאיסוף (למשל יום שני 10:00-12:00)';
