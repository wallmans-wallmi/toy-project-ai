-- תוכן מכתב AI (מסונכן עם ai_generated_letter ביישום; אפשר להרחיב ל־HTML/PDF)
alter table public.donations add column if not exists ai_letter_content text;

comment on column public.donations.ai_letter_content is 'תוכן מכתב AI — טקסט/HTML; מעודכן יחד עם ai_generated_letter אחרי תשלום';
