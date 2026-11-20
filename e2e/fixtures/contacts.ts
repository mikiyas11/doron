import type { NewContactData } from "../../src/lib/contacts/types";

/** The Contacts loaded into the e2e "list" server (inserted in this unsorted order). */
export const FIXTURE_CONTACTS: NewContactData[] = [
  { firstName: "Émile", lastName: "Zola", phoneNumbers: [{ label: "home", number: "+33 1 23 45 67 89" }] },
  { firstName: "José", lastName: "Álvarez", phoneNumbers: [{ label: "mobile", number: "(555) 012-3456" }] },
  { firstName: "Bob", phoneNumbers: [{ label: "other", number: "555 0103" }] },
  { firstName: "ana", lastName: "alvarez", phoneNumbers: [{ label: "home", number: "555 0102" }] },
  {
    firstName: "Maximiliana-Bartholomea",
    lastName: "Vandersteenhovenwijkerslootsmaeckeringhamsterdamsevaart",
    phoneNumbers: [{ label: "mobile", number: "+251 911 234 567 890 123" }],
  },
  { firstName: "barbara", lastName: "Brown", phoneNumbers: [{ label: "mobile", number: "555 0104" }] },
  {
    firstName: "Zoë",
    lastName: "Adams",
    phoneNumbers: [
      { label: "work", number: "+1 555 0100" },
      { label: "mobile", number: "555 0199" },
    ],
  },
  { firstName: "Cher", phoneNumbers: [{ label: "mobile", number: "555 0105" }] },
];
