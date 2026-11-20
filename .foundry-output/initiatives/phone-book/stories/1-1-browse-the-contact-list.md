# Story 1.1: Browse the Contact list

<!-- foundry-story: story_01a1fa1e-0148-73f6-a393-92e6035d1fe5 -->

## Story

As the owner, I want to open Phone book and see my Contacts in alphabetical order, grouped by letter, with clear guidance when there are none, so that I can scan for anyone at a glance.

## Acceptance Criteria

- Given a fresh checkout, when `pnpm install` then `pnpm dev` are run, then a Next.js 16 App Router app with TypeScript and Tailwind CSS serves `/`, and `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` and `pnpm e2e` all exist and pass. <!-- ac_01a1fa1e-014d-7897-9e82-6b7deac7c92f -->
- Given an empty database, when the owner opens `/`, then the page says there are no Contacts yet and shows an Add Contact link to `/contacts/new`. <!-- ac_01a1fa1e-014d-744c-8c14-8e0a0158050c -->
- Given Contacts exist, when the owner opens `/`, then they appear sorted case- and accent-insensitively by last name then first name (first name when there is no last name), grouped under initial-letter headings, each row showing the full Name and the first Phone number with its Label, and linking to `/contacts/[id]`. <!-- ac_01a1fa1e-014d-713f-9a81-043f099238d8 -->
- Given the app starts with no database file, when it first opens the database at `DATABASE_PATH` (default `./data/phonebook.db`), then the `contacts` and `phone_numbers` tables are created, and `data/` is git-ignored. <!-- ac_01a1fa1e-014d-706d-8ab9-fe25b3adf977 -->
- Given `pnpm seed` has loaded 2,000 Contacts, when the owner opens `/` on a mid-range phone, then the first screen of Contacts appears within 1 second and scrolling shows no visible stalls. <!-- ac_01a1fa1e-014d-7e60-8cc8-6b54a81bc184 -->
- Given a 360 px wide viewport, when the Contact list renders, then there is no horizontal scrolling. <!-- ac_01a1fa1e-014d-7ab6-ad82-41cc52705222 -->

## Notes

Covers: FR-1, FR-2, FR-3, NFR-1, NFR-3, NFR-4; binds AD-1, AD-3, AD-5, AD-6

Greenfield: the repository is empty until Story 1.1 lands. Follow the Architecture spine (AD-1..AD-6, conventions, structural seed) exactly; it names files, routes, the ActionResult shape and the normalize helpers.

- Scaffold with create-next-app (App Router, TypeScript, Tailwind, ESLint, `src/` dir, pnpm). Add Vitest (unit, `*.test.ts` beside source) and Playwright (`e2e/`); scripts per the spine's Commands row.
- Create `src/lib/db.ts` (one better-sqlite3 connection, WAL, foreign_keys ON, idempotent schema for both tables per the ERD) and `src/lib/contacts/{normalize,repository,types}.ts`. This Story needs only `listContacts()` in the repository (plus a test-only/seed insert helper); later Stories add the rest.
- `textKey` and `sort_key` per AD-3; unit-test them (e.g. "José" sorts with "jose").
- `pnpm seed` = a script that inserts N realistic Contacts through the repository (default 2,000) for FR-3 checks.
- Contact list is a Server Component in `src/app/page.tsx` with `ContactList` in `src/components/`.
