import type { ContactListItem } from "./types";

/** The full Name: first name, then last name when there is one. */
export function fullName(contact: Pick<ContactListItem, "firstName" | "lastName">): string {
  return [contact.firstName, contact.lastName ?? ""].map((part) => part.trim()).filter(Boolean).join(" ");
}

/** The heading letter for a sort key: "A" to "Z", or "#" for anything else. */
export function initialLetter(sortKey: string): string {
  const first = sortKey.charAt(0).toUpperCase();
  return first >= "A" && first <= "Z" ? first : "#";
}

export type ContactGroup = { letter: string; contacts: ContactListItem[] };

/**
 * Groups an already sorted list under initial-letter headings, keeping its order.
 * "#" (names not starting with A–Z) comes after "Z".
 */
export function groupByInitial(contacts: ContactListItem[]): ContactGroup[] {
  const groups = new Map<string, ContactListItem[]>();
  for (const contact of contacts) {
    const letter = initialLetter(contact.sortKey);
    const group = groups.get(letter);
    if (group) group.push(contact);
    else groups.set(letter, [contact]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)))
    .map(([letter, items]) => ({ letter, contacts: items }));
}
