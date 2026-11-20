# Story 1.6: Warn before saving a duplicate Phone number

<!-- foundry-story: story_01a1fa1e-0504-74a0-b01e-488e268db141 -->

Depends on: 1.4

## Story

As the owner, I want to be warned when a number I enter already belongs to another Contact, so that I do not create duplicates by mistake but can still save when I mean to.

## Acceptance Criteria

- Given another Contact has "(555) 012-3456", when the owner adds a Contact with "555-012-3456" and saves, then nothing is saved and the form names the other Contact (linking to it) and offers "Save anyway" and "Go back". <!-- ac_01a1fa1e-050e-720f-9995-778bb87021e6 -->
- Given the warning, when the owner presses "Save anyway", then the Contact is saved as usual. <!-- ac_01a1fa1e-050e-73f7-bac2-706e5a46c520 -->
- Given the warning, when the owner presses "Go back", then the form keeps all values and nothing is saved. <!-- ac_01a1fa1e-050e-74af-a356-19cb41875eb2 -->
- Given the owner edits a Contact without changing its own numbers, when they save, then no warning appears for the Contact's own Phone numbers; a number shared with a different Contact still warns. <!-- ac_01a1fa1e-050e-7121-b804-8c69cb86f449 -->

## Notes

Covers: FR-11; binds AD-2, AD-3

Greenfield: the repository is empty until Story 1.1 lands. Follow the Architecture spine (AD-1..AD-6, conventions, structural seed) exactly; it names files, routes, the ActionResult shape and the normalize helpers.

- `findContactsByPhoneDigits(digits, excludeId?)` in the repository; create and update actions check it unless the form posts `allowDuplicate=true`, returning `ActionResult.duplicate` (AD-2).
- Unit-test digit matching; Playwright for the add case.
