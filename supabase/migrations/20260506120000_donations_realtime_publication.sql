-- סנכרון חי לאזור האישי: עדכוני תרומה (למשל מאדמין) יגיעו ללקוח המחובר בלי רענון ידני
do $$
begin
  alter publication supabase_realtime add table public.donations;
exception
  when duplicate_object then
    null;
end $$;
