-- שם תצוגה לצוות (לא משמש לכניסה — הכניסה נשארת אימייל + סיסמה)
alter table public.admin_users add column if not exists username text;

comment on column public.admin_users.username is 'שם תצוגה בממשק הניהול; אימייל וסיסמה לכניסה';
