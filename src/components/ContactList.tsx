import { fullName, groupByInitial } from "@/lib/contacts/display";
import { PHONE_LABEL_TEXT, type ContactListItem } from "@/lib/contacts/types";

/**
 * The alphabetical Contact list, grouped under initial-letter headings (FR-1).
 * A Server Component with plain links, so 2,000 rows need no client-side hydration (FR-3).
 */
export function ContactList({ contacts }: { contacts: ContactListItem[] }) {
  const groups = groupByInitial(contacts);

  return (
    <nav aria-label="Contacts">
      {groups.map((group, index) => (
        <section
          key={group.letter}
          aria-labelledby={`contact-group-${index}`}
          // Off-screen groups skip layout and paint until scrolled near (FR-3).
          className="[contain-intrinsic-size:auto_600px] [content-visibility:auto]"
        >
          <h2
            id={`contact-group-${index}`}
            className="sticky top-0 border-b border-gray-200 bg-gray-100 px-4 py-1 text-sm font-semibold text-gray-700"
          >
            {group.letter}
          </h2>
          <ul>
            {group.contacts.map((contact) => (
              <li key={contact.id} className="border-b border-gray-100">
                <a
                  href={`/contacts/${contact.id}`}
                  className="block min-w-0 px-4 py-3 hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700"
                >
                  <span data-testid="contact-name" className="block truncate font-medium">
                    {fullName(contact)}
                  </span>
                  {contact.firstPhone && (
                    <span data-testid="contact-phone" className="block truncate text-sm text-gray-600">
                      <span className="font-medium text-gray-700">{PHONE_LABEL_TEXT[contact.firstPhone.label]}</span>{" "}
                      {contact.firstPhone.number}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
