---
title: Phone book — PRD addendum
created: 2026-11-20
updated: 2026-11-20
---

# PRD addendum: Phone book

Material that belongs to the architecture rather than to the PRD.

## Technology the owner asked for

- **Next.js** is the owner's choice of framework ("a phone book application with Next.js"). The architecture should settle the router (App Router expected), how Contacts are stored server-side (FR-14), and how pages read and write them (Server Actions or route handlers).

## Notes for the architecture

- Search (FR-4 to FR-6) must normalise Phone numbers to digits and Names to accent-free lower case; deciding whether that happens in the database or in memory is an architecture decision, sized for about 2,000 Contacts.
- Contact details needs a stable address per Contact (FR-12), so Contacts need a stable id.
- No sign-in in v1 (Open Question 1). The storage choice should not make adding sign-in later hard.
