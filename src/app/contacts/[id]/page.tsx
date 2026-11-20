import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { fullName, mailtoHref, telHref } from "@/lib/contacts/display";
import { getContact } from "@/lib/contacts/repository";
import { PHONE_LABEL_TEXT } from "@/lib/contacts/types";

type ContactPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const contact = getContact((await params).id);
  return { title: contact ? `${fullName(contact)} · Phone book` : "Contact not found · Phone book" };
}

/** Contact details (FR-12): every stored field, empty optional ones hidden, with one-tap call and email. */
export default async function ContactPage({ params }: ContactPageProps) {
  // Render per request: details must reflect the database, never a cached render.
  await connection();
  const { id } = await params;
  const contact = getContact(id);
  if (!contact) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl">
      <header className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
        <a href="/" className="text-sm font-medium text-blue-700 underline">
          Contacts
        </a>
      </header>

      <article aria-labelledby="contact-name" className="px-4 py-5">
        <h1 id="contact-name" className="text-2xl font-semibold break-words">
          {fullName(contact)}
        </h1>

        <dl className="mt-6 space-y-5">
          <div>
            <dt className="text-sm font-medium text-gray-600">Phone numbers</dt>
            <dd className="mt-1">
              <ul className="space-y-2">
                {contact.phoneNumbers.map((phone, index) => (
                  <li key={index} data-testid="contact-phone" className="flex items-baseline gap-3">
                    <span className="w-16 shrink-0 text-sm text-gray-600">{PHONE_LABEL_TEXT[phone.label]}</span>{" "}
                    <a href={telHref(phone.number)} className="text-lg break-all text-blue-700 underline">
                      {phone.number}
                    </a>
                  </li>
                ))}
              </ul>
            </dd>
          </div>

          {contact.email && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Email</dt>
              <dd className="mt-1">
                <a href={mailtoHref(contact.email)} className="break-all text-blue-700 underline">
                  {contact.email}
                </a>
              </dd>
            </div>
          )}

          {contact.address && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Address</dt>
              <dd className="mt-1 break-words whitespace-pre-line">{contact.address}</dd>
            </div>
          )}

          {contact.notes && (
            <div>
              <dt className="text-sm font-medium text-gray-600">Notes</dt>
              <dd className="mt-1 break-words whitespace-pre-line">{contact.notes}</dd>
            </div>
          )}
        </dl>
      </article>
    </main>
  );
}
