---
name: payment-flows
description: Implementing secure payment checkouts (like Stripe) and managing transaction states. Use when integrating Stripe or similar providers, webhooks, PCI boundaries, or checkout UI state machines.
disable-model-invocation: true
---

# Payment-Flows

## Scope

Implementing secure payment checkouts (like Stripe) and managing transaction states.

## Security and trust boundaries

- **Never** finalize paid status from the browser alone. Treat the client as untrusted for amounts, items, and eligibility.
- Run amount calculation, discounts, and inventory checks **on the server** (Route Handler, Server Action, or backend) using authoritative data.
- Do **not** collect or store raw card data in app code or Supabase; use the provider’s hosted UI, Checkout Session, or tokenization (e.g. Elements) only.

## Typical Stripe-shaped flow (Next.js)

1. **Server**: Create a PaymentIntent or Checkout Session with server-side secret key; pass only safe client fields (`clientSecret`, session URL, or session ID).
2. **Client**: Confirm payment or redirect via provider SDK; show loading / disabled UI while in flight.
3. **Webhook**: Listen for payment success/failure/dispute events; verify signatures; update your DB as the **source of truth** for “paid”.
4. **Post-payment UX**: Poll or refresh order/donation status after webhook processing (or use redirect + server read), not only client callbacks.

## Transaction state machine

Model explicit states, for example:

- `idle` → `processing` → `succeeded` | `failed` | `requires_action` | `canceled`

Rules:

- Drive UI from **your** persisted state plus limited client hints (e.g. “processing”).
- Reconcile webhook-delivered outcomes with idempotent handlers (same event may retry).
- Use **idempotency keys** on server creates/updates where the provider supports them.

## Supabase / DB

- Store provider IDs (`payment_intent_id`, `session_id`, `customer_id`) not PAN/CVV.
- Restrict updates to payment rows via RLS and service-role only where appropriate; webhooks should use a trusted server path.

## Errors and edge cases

- Handle network failures, closed tabs, and duplicate submissions (disable button, idempotent server).
- Surface user-friendly Hebrew messages; log detailed errors server-side only.

## Checklist before shipping

- [ ] Amount and line items computed server-side
- [ ] Webhook signature verification enabled
- [ ] Status transitions idempotent and webhook-driven for “paid”
- [ ] No secrets in client bundles; env vars only on server
- [ ] Tests or manual script for webhook payload handling
