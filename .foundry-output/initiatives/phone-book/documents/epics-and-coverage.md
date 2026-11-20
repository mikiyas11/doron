# Phone book - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Phone book, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

**Inputs:** "PRD" (prd), "PRD addendum" (prd), "Architecture" (architecture)

## Requirements Inventory

### Functional Requirements

FR-1: The owner sees every Contact sorted by Name (last, then first) and grouped by initial letter; rows show Name and first Phone number; a row opens the Contact's details.
FR-2: An empty Phone book shows a "no Contacts yet" message and an Add Contact action.
FR-3: With 2,000 Contacts the list's first screen appears within 1 s and scrolls without visible stalls.
FR-4: Search by any part of a first or last name, case- and accent-insensitive.
FR-5: Search by Phone number digits, ignoring spaces, dashes, dots, brackets and a leading +.
FR-6: Search updates as you type (within 300 ms for 2,000 Contacts), shows "No Contacts match" when empty, and clearing restores the list.
FR-7: Add a Contact; it opens its details, is listed in sorted place, and survives reload and restart.
FR-8: Edit any field of a Contact; the form is prefilled; cancel changes nothing.
FR-9: A Contact has 1 to 5 Phone numbers, each labelled Mobile, Home, Work or Other (default Mobile).
FR-10: Validation refuses an empty first name, invalid Phone numbers and Emails, and over-long fields, with messages beside fields and every value kept.
FR-11: Saving a Phone number another Contact has warns, naming that Contact, with Save anyway or Go back.
FR-12: Contact details shows every stored field, `tel:` and `mailto:` links, has its own URL, and a missing Contact shows "Contact not found".
FR-13: Delete a Contact after a confirmation naming it; it leaves the list and Search.
FR-14: Every reported add, edit and delete is stored on the server and survives reload and restart; a failed save says so and keeps the form's values.

### NonFunctional Requirements

NFR-1: Responsive from a 360 px wide phone to desktop, with no horizontal scrolling.
NFR-2: Accessible: keyboard-reachable actions, labelled fields, errors announced to screen readers, WCAG 2.1 AA contrast.
NFR-3: Current Chrome, Safari, Firefox and Edge, desktop and mobile.
NFR-4: Privacy: Contacts never sent to third parties; no analytics or tracking.

### Additional Requirements

- AD-1: Only `src/lib/contacts/repository.ts` runs SQL; nothing else imports `src/lib/db.ts`.
- AD-2: Create, update and delete are Server Actions validated by the one `contactInputSchema`; failures return `ActionResult` with values; success redirects; duplicate check honours `allowDuplicate`.
- AD-3: `normalize.ts` derives `sort_key`, `search_name` and phone `digits` on write; queries use only those.
- AD-4: The search query lives in `?q=`, filtered on the server, with a 200 ms debounced `router.replace`.
- AD-5: UUID Contact ids; routes `/`, `/contacts/new`, `/contacts/[id]`, `/contacts/[id]/edit`; unknown ids call `notFound()`.
- AD-6: SQLite through better-sqlite3 at `DATABASE_PATH` on a single Node server; idempotent schema on open; `:memory:` in tests.
- Starter: the app is scaffolded with create-next-app (Next.js 16, TypeScript, Tailwind CSS 4), with Vitest and Playwright added. This is Story 1.1.

### UX Design Requirements

None: the Initiative has no UX Document.

### FR Coverage Map

FR-1: Epic 1 - Contact list sorted and grouped
FR-2: Epic 1 - Empty state
FR-3: Epic 1 - List performance at 2,000 Contacts
FR-4: Epic 1 - Search by name
FR-5: Epic 1 - Search by number
FR-6: Epic 1 - Live search
FR-7: Epic 1 - Add a Contact
FR-8: Epic 1 - Edit a Contact
FR-9: Epic 1 - Labelled Phone numbers
FR-10: Epic 1 - Validation
FR-11: Epic 1 - Duplicate warning
FR-12: Epic 1 - Contact details
FR-13: Epic 1 - Delete
FR-14: Epic 1 - Durable storage

## Epic List

### Epic 1: Keep and find my Contacts
The owner can list, add, view, search, edit and delete Contacts, and the Phone book keeps them between visits. One epic, because every feature changes the same repository, form and actions.
**FRs covered:** FR-1 to FR-14

## Epic 1: Keep and find my Contacts

The owner can list, add, view, search, edit and delete Contacts, and the Phone book keeps them between visits.

### Story 1.1: Browse the Contact list

**Covers:** FR-1, FR-2, FR-3, NFR-1, NFR-3, NFR-4; binds AD-1, AD-3, AD-5, AD-6

**Depends on:** none

### Story 1.2: Add a Contact and view its details

**Covers:** FR-7, FR-9, FR-10, FR-12, FR-14, NFR-2; binds AD-1, AD-2, AD-3, AD-5

**Depends on:** 1.1

### Story 1.3: Search Contacts by name or number

**Covers:** FR-4, FR-5, FR-6; binds AD-3, AD-4

**Depends on:** 1.2

### Story 1.4: Edit a Contact

**Covers:** FR-8, FR-9, FR-10; binds AD-1, AD-2, AD-3, AD-5

**Depends on:** 1.2

### Story 1.5: Delete a Contact

**Covers:** FR-13; binds AD-1, AD-2, AD-5

**Depends on:** 1.2

### Story 1.6: Warn before saving a duplicate Phone number

**Covers:** FR-11; binds AD-2, AD-3

**Depends on:** 1.4
