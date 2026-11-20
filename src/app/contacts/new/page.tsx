import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { EMPTY_CONTACT_INPUT } from "@/lib/contacts/schema";
import { createContact } from "../actions";

export const metadata: Metadata = {
  title: "Add Contact · Phone book",
};

/** Add a Contact (FR-7). */
export default function NewContactPage() {
  return (
    <main className="mx-auto w-full max-w-2xl">
      <header className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-semibold">Add Contact</h1>
        <a href="/" className="text-sm font-medium text-blue-700 underline">
          Contacts
        </a>
      </header>
      <ContactForm action={createContact} initialValues={EMPTY_CONTACT_INPUT} submitLabel="Save" />
    </main>
  );
}
