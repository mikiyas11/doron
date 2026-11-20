---
title: Phone book
status: final
created: 2026-11-20
updated: 2026-11-20
---

# PRD: Phone book
*Working title — confirm.*

## 0. Document Purpose

This PRD is for the owner of the Phone book app and for the Foundry stages that follow it: the architecture, the epics and Stories, and the Runs that build them. Vocabulary is fixed by the Glossary (§3). Features are grouped in §4, with functional requirements numbered globally (FR-1 to FR-14). Every inference made without confirmation is tagged `[ASSUMPTION]` inline and listed in §9. No earlier inputs exist: the repository is empty, and this PRD is drafted from the request "a phone book application with Next.js".

## 1. Vision

Phone book is a small web app for keeping the people you need to reach in one place, with each person's phone numbers, email and address. Open it, type a few letters of a name or digits of a number, and the right Contact is there with a number you can call in one tap.

It does few things and does them quickly: list, find, add, change and remove Contacts. It runs in any modern browser on a phone or a computer, and it keeps the same Contacts between visits.

## 2. Target User

### 2.1 Jobs To Be Done

- **Functional:** find someone's number in seconds, by name or by part of the number.
- **Functional:** record a new person while their details are at hand, without filling a long form.
- **Functional:** keep details current: change a number, add a second one, remove someone who is gone.
- **Contextual:** use it from a phone as easily as from a laptop.

### 2.2 Non-Users (v1)

- Teams or organisations sharing one directory with roles and permissions. `[ASSUMPTION: v1 is a personal phone book with a single owner]`
- People who need sync with their phone's native contacts or with Google/Outlook.

### 2.3 Key User Journeys

- **UJ-1. Dawit finds a plumber's number while the sink leaks.** Dawit opens Phone book on his phone and sees his Contacts in alphabetical order. He types "plu" in the search box; the list narrows to "Plumber – Abebe" as he types. He taps the Contact, sees two Phone numbers labelled Mobile and Work, and taps Mobile, which opens his phone's dialer. **Edge case:** the search matches nothing; the app says so and offers to add a Contact.
- **UJ-2. Sara adds a new colleague after a meeting.** Sara presses Add Contact, types the first and last name and one mobile number, and saves. She lands on the new Contact's details, and the Contact appears in the list in its alphabetical place. **Edge case:** she leaves the name empty; the form keeps what she typed and says the name is required.
- **UJ-3. Sara corrects and tidies her Contacts.** A colleague changes jobs. Sara opens the Contact, presses Edit, changes the Work number, adds an Email, and saves. Later she deletes a Contact she no longer needs, confirms the deletion, and it is gone from the list and search.

## 3. Glossary

- **Owner** — the one person who uses the Phone book and whose Contacts it holds. `[ASSUMPTION]`
- **Phone book** — the app, and the single collection of Contacts it holds. One owner. `[ASSUMPTION]`
- **Contact** — one person or organisation in the Phone book. Has a Name, one or more Phone numbers, and optional Email, Address and Notes.
- **Name** — a Contact's first name (required) and last name (optional). Contacts are sorted by Name: last name, then first name; a Contact with no last name sorts by first name. `[ASSUMPTION]`
- **Phone number** — a number stored on a Contact, with a Label. A Contact has 1 to 5 Phone numbers. `[ASSUMPTION: the limit of 5]`
- **Label** — the kind of a Phone number: Mobile, Home, Work or Other.
- **Contact list** — the alphabetical view of all Contacts, grouped under initial letters.
- **Search** — narrowing the Contact list by text matched against Names and Phone numbers.
- **Contact details** — the view of one Contact with all its fields and actions.

## 4. Features

### 4.1 Contact list

**Description:** The home screen is the Contact list. Contacts appear in alphabetical order by Name, grouped under their initial letter, each row showing the full Name and the first Phone number. An empty Phone book shows a short message and an Add Contact action instead of an empty list. Realizes UJ-1, UJ-2.

#### FR-1: View all Contacts in order

The owner can see every Contact in the Contact list, sorted by Name and grouped by initial letter. Realizes UJ-1.

**Consequences (testable):**
- Contacts appear sorted by last name, then first name, case-insensitively; a Contact with no last name sorts by first name.
- Each row shows the Contact's full Name and its first Phone number with its Label.
- Selecting a row opens that Contact's details.

#### FR-2: Empty Phone book

The owner sees guidance, not a blank screen, when the Phone book holds no Contacts.

**Consequences (testable):**
- With zero Contacts, the Contact list shows a message saying there are no Contacts yet and an Add Contact action.

#### FR-3: Contact list stays usable as it grows

The Contact list remains usable with a large Phone book. `[ASSUMPTION: up to 2,000 Contacts]`

**Consequences (testable):**
- With 2,000 Contacts, the Contact list renders and scrolls without visible stalls, and the first screen of Contacts appears within 1 second on a mid-range phone over a normal connection.

### 4.2 Search

**Description:** A search box sits above the Contact list. As the owner types, the list narrows to Contacts whose Name or Phone numbers match. Clearing the box restores the full list. Realizes UJ-1.

#### FR-4: Search by Name

The owner can find Contacts by typing any part of a first or last name. Realizes UJ-1.

**Consequences (testable):**
- Typing "plu" shows every Contact whose first or last name contains "plu", case-insensitively, and no other Contact.
- Accented and unaccented letters match each other (typing "jose" finds "José"). `[ASSUMPTION]`

#### FR-5: Search by Phone number

The owner can find Contacts by typing digits from any of their Phone numbers.

**Consequences (testable):**
- Spaces, dashes, dots, brackets and a leading "+" are ignored on both sides: typing "555 01" finds a Contact whose Phone number is stored as "(555) 012-3456".

#### FR-6: Search responds as you type

The owner sees Search results update while typing, and a clear message when nothing matches. Realizes UJ-1.

**Consequences (testable):**
- The list updates as the owner types, with no submit button, and reflects the latest text within 300 ms of the last keystroke for a Phone book of 2,000 Contacts.
- When nothing matches, the list shows "No Contacts match" with the search text and an Add Contact action.
- Clearing the search box restores the full Contact list.

### 4.3 Add and edit a Contact

**Description:** One form serves both adding and editing. It asks for first name, last name, Phone numbers (each with a Label), Email, Address and Notes. Only the first name and one Phone number are required. Phone numbers can be added and removed within the form, down to one. On save the owner lands on the Contact's details. Realizes UJ-2, UJ-3.

#### FR-7: Add a Contact

The owner can add a Contact from the Contact list. Realizes UJ-2.

**Consequences (testable):**
- Saving a form with a first name and one valid Phone number creates the Contact, opens its details, and shows it in the Contact list in its sorted place.
- The new Contact is still there after the page is reloaded and after the app is restarted.

#### FR-8: Edit a Contact

The owner can change any field of an existing Contact. Realizes UJ-3.

**Consequences (testable):**
- The edit form opens filled with the Contact's current values.
- Saving replaces the stored values; the Contact list and Search reflect the change at once.
- Cancelling leaves the Contact unchanged.

#### FR-9: Several Phone numbers per Contact

The owner can give a Contact 1 to 5 Phone numbers, each with a Label (Mobile, Home, Work, Other).

**Consequences (testable):**
- The form has an action to add a Phone number (hidden or disabled at 5) and to remove one (not available when only one remains).
- A new Phone number's Label defaults to Mobile.

#### FR-10: Validation keeps the owner's input

The form refuses invalid input and says why, without losing what was typed. Realizes UJ-2 (edge case).

**Consequences (testable):**
- An empty first name is refused with a message beside the field.
- A Phone number is accepted when, after removing spaces, dashes, dots and brackets, it is an optional leading "+" followed by 3 to 15 digits; otherwise it is refused with a message beside it. `[ASSUMPTION: no country-specific formatting in v1]`
- An Email that is not of the form name@domain is refused.
- First name and last name are each at most 100 characters, Address at most 300, Notes at most 2,000.
- On any refusal, every field keeps the value the owner typed.

#### FR-11: Warn on a duplicate Phone number

The owner is warned before saving a Phone number that another Contact already has. `[ASSUMPTION]`

**Consequences (testable):**
- When a Phone number on the form matches one on another Contact (comparing digits only), the form names that Contact and lets the owner save anyway or go back.

### 4.4 Contact details and delete

**Description:** Contact details shows every field of one Contact. Phone numbers and the Email are links that start a call or an email on devices that support it. From here the owner can edit or delete the Contact. Realizes UJ-1, UJ-3.

#### FR-12: View Contact details

The owner can open one Contact and act on its Phone numbers and Email. Realizes UJ-1.

**Consequences (testable):**
- Every stored field is shown; empty optional fields are not shown.
- Each Phone number is a `tel:` link and the Email a `mailto:` link.
- Contact details has its own address (URL), so it can be bookmarked and reopened directly.
- Opening the address of a Contact that does not exist shows a "Contact not found" page with a way back to the Contact list.

#### FR-13: Delete a Contact

The owner can delete a Contact after confirming. Realizes UJ-3.

**Consequences (testable):**
- Delete asks for confirmation naming the Contact; cancelling keeps it.
- After confirming, the owner returns to the Contact list, and the Contact no longer appears in the list or in Search, including after a reload.

### 4.5 Reliability of the data

#### FR-14: Contacts are kept safely

The owner's changes are stored durably, and a failed save is never silent.

**Consequences (testable):**
- Every add, edit and delete that the app reports as done is stored on the server and survives a page reload, closing the browser, and a restart of the app. `[ASSUMPTION: Contacts are stored server-side, not only in the browser, so the same Phone book is seen from the phone and the laptop]`
- When a save fails (for example, the server cannot be reached), the app says so and keeps the form's values, so the owner can try again.

## 5. Cross-Cutting Non-Functional Requirements

- **Responsive:** every screen works from a 360 px wide phone to a desktop browser, with no horizontal scrolling.
- **Accessible:** every action is reachable by keyboard; form fields have labels; errors are announced to screen readers; text contrast meets WCAG 2.1 AA.
- **Browsers:** current versions of Chrome, Safari, Firefox and Edge, on desktop and mobile.
- **Privacy:** Contacts are personal data. They are never sent to a third-party service, and the app sets no analytics or tracking. `[ASSUMPTION]`

## 6. Non-Goals (Explicit)

- Not a CRM: no companies, deals, activity history or reminders.
- Not a shared or team directory: no multiple users, roles or sharing in v1.
- Not a calling or messaging app: calling and emailing hand off to the device.
- No sync with phone, Google or Outlook contacts.

## 7. MVP Scope

### 7.1 In Scope

- Contact list with alphabetical grouping and empty state (FR-1 to FR-3).
- Search by Name and Phone number (FR-4 to FR-6).
- Add, edit and validate a Contact with up to 5 labelled Phone numbers (FR-7 to FR-11).
- Contact details with tap-to-call and tap-to-email, and delete with confirmation (FR-12, FR-13).
- Server-side storage of Contacts (FR-14).

### 7.2 Out of Scope for MVP

- Sign-in and access control. `[ASSUMPTION: v1 runs locally or on a private deployment; see Open Question 1]`
- Import and export (vCard, CSV) — deferred to v2.
- Favourites, groups or tags — deferred to v2.
- Contact photos — deferred to v2.
- Undo after delete — the confirmation step covers v1.
- Offline use when the server cannot be reached.

## 8. Success Metrics

- **SM-1:** The owner finds any Contact by Search in under 5 seconds from opening the app. Validates FR-4 to FR-6, FR-12.
- **SM-2:** The owner adds a Contact with a name and one number in under 30 seconds. Validates FR-7, FR-10.
- **SM-C1 (counter-metric):** Number of fields on the add form. Do not add required fields to make Contacts "richer": it slows SM-2. Counterbalances SM-2.

## 9. Open Questions

1. Will the app be deployed where others can reach it? If so, v1 needs sign-in before any Contact is stored, and this changes FR-14 and the MVP scope. Until answered, v1 assumes local or private use.
2. Should Phone numbers be formatted for display by country (for example "+251 91 123 4567"), and is there a default country?
3. Is v1 for one person only, or should several people each have their own Phone book?

## 10. Assumptions Index

- §2.2, §3 — v1 is a personal Phone book with a single owner; no multiple users.
- §3 — sorting is by last name, then first name.
- §3, FR-9 — a Contact has at most 5 Phone numbers.
- FR-3 — size target of up to 2,000 Contacts.
- FR-4 — accented and unaccented letters match in Search.
- FR-10 — Phone numbers are validated as "+" and 3 to 15 digits, with no country-specific rules.
- FR-11 — a duplicate Phone number triggers a warning, not a refusal.
- FR-14 — Contacts are stored on the server, so every device sees the same Phone book.
- §5 — no analytics or third-party services.
- §7.2 — no sign-in in v1, because the app runs locally or privately.
