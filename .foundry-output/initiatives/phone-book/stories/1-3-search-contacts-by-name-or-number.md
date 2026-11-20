# Story 1.3: Search Contacts by name or number

<!-- foundry-story: story_01a1fa1e-02fd-77a9-ae0e-a318d057d55e -->

Depends on: 1.2

## Story

As the owner, I want to type part of a name or number and see matching Contacts as I type, so that I find anyone in seconds.

## Acceptance Criteria

- Given Contacts exist, when the owner types "plu" in the search box on `/`, then only Contacts whose first or last name contains "plu" are listed, case-insensitively, and typing "jose" also finds "José". <!-- ac_01a1fa1e-0307-7742-9f01-67c4339873be -->
- Given a Contact with Phone number "(555) 012-3456", when the owner types "555 01" or "+5550", then that Contact is listed (spaces, dashes, dots, brackets and a leading + ignored on both sides). <!-- ac_01a1fa1e-0307-7bb8-b1f6-9469e5983985 -->
- Given the owner is typing, when they pause, then the list reflects the latest text within 300 ms with 2,000 Contacts, with no submit button, the query is kept in `?q=` without a history entry per keystroke, and reloading the page keeps the results. <!-- ac_01a1fa1e-0307-74ec-b19a-10148ddccb7a -->
- Given a query matches nothing, when the list updates, then it shows "No Contacts match" with the search text and an Add Contact link. <!-- ac_01a1fa1e-0307-7500-a5ca-51c9395155bb -->
- Given a query is active, when the owner clears the search box, then `?q=` is removed and the full Contact list returns. <!-- ac_01a1fa1e-0307-7579-a8fd-ecc512ad9292 -->

## Notes

Covers: FR-4, FR-5, FR-6; binds AD-3, AD-4

Greenfield: the repository is empty until Story 1.1 lands. Follow the Architecture spine (AD-1..AD-6, conventions, structural seed) exactly; it names files, routes, the ActionResult shape and the normalize helpers.

- Extend `listContacts(query?)` per AD-3 (search_name LIKE, and phone digits LIKE only when the query has digits). `SearchBox` Client Component with a 200 ms debounced `router.replace` (AD-4).
- Unit-test the query against `:memory:`; Playwright for UJ-1 including the no-match case.
