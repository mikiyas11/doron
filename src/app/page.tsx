import { connection } from "next/server";
import { ContactList } from "@/components/ContactList";
import { listContacts } from "@/lib/contacts/repository";

const addContactClass =
  "inline-flex shrink-0 items-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700";

/** The Contact list (FR-1, FR-2, FR-3), read on the server for every request. */
export default async function HomePage() {
  // Render per request: the list must reflect the database, never a build-time snapshot.
  await connection();
  const contacts = listContacts();

  return (
    <main className="mx-auto w-full max-w-2xl">
      <header className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-semibold">Phone book</h1>
        {contacts.length > 0 && (
          <a href="/contacts/new" className={addContactClass}>
            Add Contact
          </a>
        )}
      </header>

      {contacts.length === 0 ? (
        <section aria-labelledby="empty-heading" className="px-4 py-16 text-center">
          <h2 id="empty-heading" className="text-lg font-medium">
            No Contacts yet
          </h2>
          <p className="mt-2 text-gray-600">Add the people you want to reach, with their Phone numbers.</p>
          <a href="/contacts/new" className={`mt-6 ${addContactClass}`}>
            Add Contact
          </a>
        </section>
      ) : (
        <ContactList contacts={contacts} />
      )}
    </main>
  );
}
