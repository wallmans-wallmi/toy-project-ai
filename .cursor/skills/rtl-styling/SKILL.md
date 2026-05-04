---
name: rtl-styling
description: Expertise in building Hebrew-compatible layouts using Tailwind RTL utilities. Use when styling Hebrew UI, RTL layouts, mirroring, logical spacing, or fixing left/right bugs in Tailwind.
disable-model-invocation: true
---

# RTL-Styling

## Scope

Expertise in building Hebrew-compatible layouts using Tailwind RTL utilities.

## Root setup (Next.js)

- Set document direction and language on the root layout: `dir="rtl"` and `lang="he"` on `<html>` (or the outermost app wrapper).
- Prefer one consistent RTL root; avoid mixing `dir` on nested subtrees unless there is a deliberate bilingual island (then mark LTR islands with `dir="ltr"`).

## Tailwind: prefer logical properties

- Use **logical** spacing and positioning instead of physical left/right: `ms-*` / `me-*`, `ps-*` / `pe-*`, `start-*` / `end-*`, `border-s-*` / `border-e-*`, `rounded-s-*` / `rounded-e-*`, `text-start` / `text-end`.
- Avoid `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*` for layout that must mirror in RTL unless there is a documented exception (e.g. fixed overlays tied to viewport edges).

## Variants and plugins

- If the project uses directional variants (`rtl:` / `ltr:`) or a Tailwind RTL plugin, use them only when logical utilities cannot express the design (icons, asymmetric illustrations, rare “do not mirror” cases).
- After changes, sanity-check both RTL and any embedded LTR segments (numbers, URLs, code).

## Common pitfalls

- **Icons and chevrons**: confirm whether they should mirror; use `scale-x-[-1]` or directional variants only when the design requires it.
- **Flex/grid**: `justify-start` / `items-start` follow logical start/end; verify scroll containers and sticky headers in RTL.
- **Forms**: labels, error text, and inline validation should align to `text-start` unless specified otherwise.

## Verification

- Scan changed components for physical `left`/`right` Tailwind classes; convert to logical equivalents where mirroring is intended.
- Smoke-test critical flows (navigation, modals, forms) with RTL root enabled.
