# Story 1.4: Edit a Contact

<!-- foundry-story: story_01a1fa1e-03a7-796c-a49e-4a67ff0d61ce -->

Depends on: 1.2

## Story

As the owner, I want to change any detail of a Contact, including adding or removing Phone numbers, so that my Phone book stays current.

## Acceptance Criteria

- Given a Contact's details, when the owner presses Edit, then `/contacts/[id]/edit` opens the form filled with the Contact's current values, Phone numbers in their stored order. <!-- ac_01a1fa1e-03b1-7ead-bd47-ff0eb34e8c39 -->
- Given the edit form, when the owner changes fields (for example the Work number and a new Email) and saves, then the stored values are replaced, the owner lands on the details, and the Contact list and Search reflect the change at once. <!-- ac_01a1fa1e-03b1-748c-b268-162c467c809b -->
- Given the edit form, when the owner cancels, then the Contact is unchanged. <!-- ac_01a1fa1e-03b1-744d-a50c-2d275c10f0ed -->
- Given invalid input, when the owner saves an edit, then it is refused with the same rules and messages as adding, keeping every typed value. <!-- ac_01a1fa1e-03b1-7bbf-835f-fb398f7582ba -->
- Given an id that does not exist, when `/contacts/[id]/edit` is opened, then the "Contact not found" page is shown. <!-- ac_01a1fa1e-03b1-7388-bd8c-509ca4a83651 -->

## Notes

Covers: FR-8, FR-9, FR-10; binds AD-1, AD-2, AD-3, AD-5

Greenfield: the repository is empty until Story 1.1 lands. Follow the Architecture spine (AD-1..AD-6, conventions, structural seed) exactly; it names files, routes, the ActionResult shape and the normalize helpers.

- Reuse `ContactForm` and `contactInputSchema` from Story 1.2; add `updateContact(id, input)` (replace the Contact's phone rows in one transaction, recomputing sort_key, search_name and digits) and an `updateContact` Server Action.
- Playwright: UJ-3 edit half.
