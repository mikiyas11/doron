# Story 1.2: Add a Contact and view its details

<!-- foundry-story: story_01a1fa1e-024d-7f60-8b72-a55a267b33f0 -->

Depends on: 1.1

## Story

As the owner, I want to add a Contact with a name and up to five labelled Phone numbers and then see its details with one-tap call and email, so that I can record someone while their details are at hand.

## Acceptance Criteria

- Given the Contact list, when the owner presses Add Contact, fills a first name and one valid Phone number and saves, then the Contact is stored, the owner lands on `/contacts/[id]`, and the Contact appears in its sorted place on `/`, including after a reload and an app restart. <!-- ac_01a1fa1e-0257-7f59-91be-7dccdf1a64ed -->
- Given the add form, when the owner adds Phone numbers, then they can have 1 to 5, each with a Label of Mobile, Home, Work or Other (new ones default to Mobile); the add action is unavailable at 5 and remove is unavailable when only one remains. <!-- ac_01a1fa1e-0257-75f6-ae89-04c15b75c756 -->
- Given invalid input (empty first name; a Phone number that is not an optional + and 3 to 15 digits after removing spaces, dashes, dots and brackets; an Email not of the form name@domain; first or last name over 100, Address over 300 or Notes over 2,000 characters), when the owner saves, then the save is refused, a message appears beside each bad field, and every field keeps what the owner typed. <!-- ac_01a1fa1e-0257-795f-82dd-71ef4f55259b -->
- Given a stored Contact, when the owner opens `/contacts/[id]`, then every stored field is shown, empty optional fields are hidden, each Phone number is a `tel:` link and the Email a `mailto:` link. <!-- ac_01a1fa1e-0257-7e29-9b3c-6ed74c80ccb1 -->
- Given an id that does not exist, when `/contacts/[id]` is opened, then a "Contact not found" page links back to the Contact list. <!-- ac_01a1fa1e-0257-7f8e-85c0-709dcbdd3b8d -->
- Given the server fails to save, when the owner saves, then the form shows "Could not save. Try again." and keeps all values. <!-- ac_01a1fa1e-0257-756c-be53-379e62022095 -->
- Given a keyboard-only or screen-reader user, when they fill and submit the form, then every input has a label, errors are linked with `aria-describedby`, and the error summary is announced (`role="alert"`). <!-- ac_01a1fa1e-0257-7892-b915-2ff7192ece90 -->

## Notes

Covers: FR-7, FR-9, FR-10, FR-12, FR-14, NFR-2; binds AD-1, AD-2, AD-3, AD-5

Greenfield: the repository is empty until Story 1.1 lands. Follow the Architecture spine (AD-1..AD-6, conventions, structural seed) exactly; it names files, routes, the ActionResult shape and the normalize helpers.

- `contactInputSchema` (Zod) in `src/lib/contacts/schema.ts` is the single home of the FR-10 rules; `createContact` and `getContact` in the repository; `createContact` Server Action in `src/app/contacts/actions.ts` returning `ActionResult` on failure and redirecting on success.
- `ContactForm` (Client Component, `useActionState`) is built to be reused by edit in Story 1.4: take initial values and the action as props.
- Store each Phone number's `digits` via `phoneDigits` and its `position`.
- Playwright: UJ-2 happy path and empty-name edge case.
