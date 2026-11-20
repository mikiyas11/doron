/** Shown for `/contacts/[id]` when no Contact has that id (AD-5). */
export default function ContactNotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Contact not found</h1>
      <p className="mt-2 text-gray-600">This Contact does not exist. It may have been deleted.</p>
      <a
        href="/"
        className="mt-6 inline-flex items-center rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        Back to Contacts
      </a>
    </main>
  );
}
