-- שם יעד/מוסד שאליו הגיעו הצעצועים (מילוי ידני ע"י אדמין אחרי האיסוף)
alter table public.donations add column if not exists destination_name text;

comment on column public.donations.destination_name is 'שם המקום שאליו הוצאו הצעצועים — משמש במכתב תודה מהמקבלים לילד התורם';
