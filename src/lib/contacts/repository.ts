import { randomUUID } from "node:crypto";
import { getDb } from "../db";
import { phoneDigits, searchName, sortKey } from "./normalize";
import type { Contact, ContactListItem, NewContactData, PhoneLabel, PhoneNumber } from "./types";

/**
 * The only module that runs SQL against `contacts` and `phone_numbers` (AD-1).
 */

type ListRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  sort_key: string;
  label: PhoneLabel | null;
  number: string | null;
};

/** Every Contact with its first Phone number, ordered by `sort_key, id` (AD-3). */
export function listContacts(): ContactListItem[] {
  const rows = getDb()
    .prepare<[], ListRow>(
      `SELECT c.id, c.first_name, c.last_name, c.sort_key, p.label, p.number
         FROM contacts c
         LEFT JOIN phone_numbers p ON p.contact_id = c.id AND p.position = 0
        ORDER BY c.sort_key, c.id`,
    )
    .all();
  return rows.map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    sortKey: row.sort_key,
    firstPhone: row.label !== null && row.number !== null ? { label: row.label, number: row.number } : null,
  }));
}

function emptyToNull(value: string | null | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}

function insertOne(data: NewContactData): string {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  const lastName = emptyToNull(data.lastName);
  db.prepare(
    `INSERT INTO contacts (id, first_name, last_name, email, address, notes, sort_key, search_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    data.firstName,
    lastName,
    emptyToNull(data.email),
    emptyToNull(data.address),
    emptyToNull(data.notes),
    sortKey(data.firstName, lastName),
    searchName(data.firstName, lastName),
    now,
    now,
  );
  const insertPhone = db.prepare(
    `INSERT INTO phone_numbers (contact_id, label, number, digits, position) VALUES (?, ?, ?, ?, ?)`,
  );
  data.phoneNumbers.forEach((phone, position) => {
    insertPhone.run(id, phone.label, phone.number, phoneDigits(phone.number), position);
  });
  return id;
}

/**
 * Stores one Contact and its Phone numbers (with their `digits` and entered `position`) in one
 * transaction, and returns its new id. Callers validate first with `contactInputSchema` (AD-2).
 */
export function createContact(contact: NewContactData): string {
  return getDb().transaction(insertOne)(contact);
}

type ContactRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** One Contact with every stored field and its Phone numbers in entered order, or `null` for an unknown id. */
export function getContact(id: string): Contact | null {
  const db = getDb();
  const row = db
    .prepare<[string], ContactRow>(
      `SELECT id, first_name, last_name, email, address, notes, created_at, updated_at
         FROM contacts
        WHERE id = ?`,
    )
    .get(id);
  if (!row) return null;
  const phoneNumbers = db
    .prepare<[string], PhoneNumber>(
      `SELECT label, number FROM phone_numbers WHERE contact_id = ? ORDER BY position`,
    )
    .all(id);
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    address: row.address,
    notes: row.notes,
    phoneNumbers: phoneNumbers.map(({ label, number }) => ({ label, number })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Inserts Contacts without validation, in one transaction, and returns their ids.
 * For the seed script and tests only: the app's writes go through `createContact`.
 */
export function insertContacts(contacts: NewContactData[]): string[] {
  return getDb().transaction((items: NewContactData[]) => items.map(insertOne))(contacts);
}

/** Inserts one Contact; see `insertContacts`. */
export function insertContact(contact: NewContactData): string {
  return insertContacts([contact])[0];
}
