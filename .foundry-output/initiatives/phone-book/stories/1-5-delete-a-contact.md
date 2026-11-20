# Story 1.5: Delete a Contact

<!-- foundry-story: story_01a1fa1e-0453-70b7-b173-502a55e40e74 -->

Depends on: 1.2

## Story

As the owner, I want to delete a Contact after confirming, so that people I no longer need leave my Phone book without accidents.

## Acceptance Criteria

- Given a Contact's details, when the owner presses Delete, then a confirmation names the Contact, and cancelling keeps it. <!-- ac_01a1fa1e-045c-7eb7-909e-6462356d65ca -->
- Given the confirmation, when the owner confirms, then the Contact and its Phone numbers are removed, the owner returns to `/`, and the Contact no longer appears in the list or in Search, including after a reload. <!-- ac_01a1fa1e-045c-7f9b-b4bf-ada222bbae03 -->
- Given the delete fails on the server, when the owner confirms, then an error says the Contact could not be deleted and it is still listed. <!-- ac_01a1fa1e-045c-7420-9433-8301a3a335a8 -->
- Given a keyboard-only user, when the confirmation opens, then focus moves into it, Escape cancels, and focus returns to the Delete button. <!-- ac_01a1fa1e-045c-70cc-b879-e94330271498 -->

## Notes

Covers: FR-13; binds AD-1, AD-2, AD-5

Greenfield: the repository is empty until Story 1.1 lands. Follow the Architecture spine (AD-1..AD-6, conventions, structural seed) exactly; it names files, routes, the ActionResult shape and the normalize helpers.

- `deleteContact(id)` in the repository (phone rows go by ON DELETE CASCADE); `deleteContact` Server Action redirecting to `/`; `DeleteContactButton` Client Component (a native `<dialog>` is fine).
- Playwright: UJ-3 delete half.
