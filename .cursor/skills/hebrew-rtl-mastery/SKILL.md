---
name: hebrew-rtl-mastery
description: "Automatically applies dir='rtl' and ensures Tailwind classes respect the right-to-left flow."
disable-model-invocation: true
---

# Hebrew-RTL-Mastery

## Root direction and language

- Set **`dir="rtl"`** and **`lang="he"`** on the document root (Next.js App Router: outermost `<html>` in `app/layout.tsx`).
- Keep one RTL root for the public site; use **`dir="ltr"`** only for deliberate bilingual islands (numbers-heavy widgets, code snippets, embedded English).

## Tailwind: logical flow

- Prefer **logical** utilities so layout mirrors correctly: `ms-*` / `me-*`, `ps-*` / `pe-*`, `start-*` / `end-*`, `border-s-*` / `border-e-*`, `rounded-s-*` / `rounded-e-*`, `text-start` / `text-end`.
- Avoid physical **`ml-*` / `mr-*` / `pl-*` / `pr-*` / `left-*` / `right-*`** for structural layout unless there is a documented exception (e.g. viewport-anchored overlays).

## Icons, flex, and forms

- **Icons and chevrons**: mirror only when it aids comprehension; use `rtl:` / `ltr:` or `scale-x-[-1]` sparingly when logical utilities are not enough.
- **Flex/grid**: rely on start/end semantics; recheck scroll areas and sticky chrome in RTL.
- **Forms**: align helper and error text with **`text-start`** unless the design specifies otherwise.

## Hebrew UI copy

- Public UI strings should read as **warm, friendly Hebrew** (project rule); RTL layout supports that readability—do not ship mixed-direction paragraphs without clear structure.

## Verification

- After edits, scan for physical `left`/`right` Tailwind classes in changed files and convert where mirroring is intended.
- Smoke-test navigation, modals, and forms with the RTL root enabled.

## Additional resources

- For an extended RTL Tailwind checklist, see [../rtl-styling/SKILL.md](../rtl-styling/SKILL.md).
