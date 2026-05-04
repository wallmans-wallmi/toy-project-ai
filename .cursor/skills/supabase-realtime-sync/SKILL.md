---
name: supabase-realtime-sync
description: "Enables live updates in the Admin Dashboard so new donations appear instantly without page refreshes."
disable-model-invocation: true
---

# Supabase-Realtime-Sync

## Scope

Wire **Supabase Realtime** so **`/admin`** lists and detail views reflect **new and updated donations** as they happen, without full page reloads.

## Prerequisites (Supabase project)

1. **Publication**: Ensure `supabase_realtime` publishes the **`donations`** table (and any related tables the admin list joins), via Replication / Realtime settings in the dashboard or SQL publication.
2. **RLS**: Realtime still respects **Row Level Security**. Confirm policies allow **authenticated admin** (or your chosen role) to **SELECT** rows you expect to receive events for.

## Client pattern (Next.js App Router)

- Subscribe from a **Client Component** used under **`/admin`** (e.g. donations table wrapper). Server Components cannot hold WebSocket subscriptions.
- Use the browser Supabase client (anon key + user session). **Do not** embed service-role keys in the client.
- Channel shape (adjust schema/table to match the project):

```ts
const channel = supabase
  .channel("admin-donations")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "donations" },
    (payload) => {
      // Merge payload.new / payload.old into local state or trigger a targeted refetch
    }
  )
  .subscribe();

return () => {
  supabase.removeChannel(channel);
};
```

## State handling

- **Small lists**: upsert/remove rows in React state from `payload` for instant UI.
- **Complex filters or pagination**: on `INSERT`/`UPDATE`/`DELETE`, call a **narrow refetch** (e.g. `router.refresh()`, SWR mutate, or React Query invalidate) so the list stays consistent with server sorting and filters.
- **Duplicates**: guard against double delivery by **id** (merge by primary key).

## Security and scope

- Prefer **topic narrow filters** (`filter: \`id=eq.${id}\``) when subscribing from a detail page; on the dashboard index, subscribe only to what admins are allowed to see.
- Never subscribe from **public** routes with broader access than RLS allows.

## Failure modes

- Show a **non-blocking** reconnect hint if the channel errors; fall back to manual refresh.
- Avoid blocking the whole admin shell on subscription startup—render cached data first, then attach the channel in `useEffect`.

## Checklist before shipping

- [ ] `donations` (and dependencies) published to Realtime
- [ ] RLS verified for admin role receiving events
- [ ] Subscription scoped to `/admin` client components only
- [ ] Cleanup `removeChannel` on unmount
- [ ] Dedupe by row id; refetch if filters/sorts make pure client merge risky
