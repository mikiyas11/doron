import { PHONE_LABELS, type NewContactData, type PhoneNumber } from "../src/lib/contacts/types";

const FIRST_NAMES = [
  "Abebe", "Almaz", "Ana", "Barbara", "Bekele", "Carlos", "Chloé", "Dawit", "Desta", "Élodie",
  "Emma", "Fatima", "François", "Getachew", "Hana", "Helen", "Ibrahim", "Isabel", "Jakub", "José",
  "Kidist", "Liam", "Lucía", "Mekdes", "Mohammed", "Noah", "Olivia", "Óscar", "Priya", "Rahel",
  "Sara", "Selam", "Søren", "Tewodros", "Tomás", "Wei", "Yared", "Yohannes", "Zoë", "Zoltán",
];

const LAST_NAMES = [
  "Abate", "Adams", "Alemu", "Álvarez", "Bekele", "Brown", "Chen", "Dubois", "Fernández", "García",
  "Girma", "Haile", "Hernández", "Ivanova", "Johnson", "Kebede", "Kowalski", "Lemma", "López", "Martin",
  "Mengistu", "Müller", "Nguyen", "Novák", "O'Brien", "Patel", "Rossi", "Schmidt", "Smith", "Tadesse",
  "Tesfaye", "Van der Berg", "Wolde", "Wondimu", "Yilma", "Zewdu", "Zola", "Østergaard", "Şahin", "Ñúñez",
];

const ORGANISATIONS = ["Plumber", "Dentist", "Garage", "Pharmacy", "Taxi", "Bakery", "Electrician", "Vet"];

/** A small deterministic PRNG (mulberry32), so every seed run produces the same Phone book. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

function digits(random: () => number, count: number): string {
  let out = "";
  for (let i = 0; i < count; i++) out += Math.floor(random() * 10);
  return out;
}

function phoneNumber(random: () => number): string {
  const formats = [
    () => `+251 9${digits(random, 1)} ${digits(random, 3)} ${digits(random, 4)}`,
    () => `(555) ${digits(random, 3)}-${digits(random, 4)}`,
    () => `+1 555 ${digits(random, 3)} ${digits(random, 4)}`,
    () => `0${digits(random, 2)}.${digits(random, 3)}.${digits(random, 4)}`,
    () => `+44 20 ${digits(random, 4)} ${digits(random, 4)}`,
  ];
  return pick(random, formats)();
}

/** `count` realistic Contacts: varied names (some accented, some without a last name), 1–3 labelled numbers. */
export function generateContacts(count: number, seed = 20261120): NewContactData[] {
  const random = createRandom(seed);
  const contacts: NewContactData[] = [];
  for (let i = 0; i < count; i++) {
    const roll = random();
    const firstName = roll < 0.05 ? pick(random, ORGANISATIONS) : pick(random, FIRST_NAMES);
    const lastName = roll < 0.05 ? pick(random, FIRST_NAMES) : roll < 0.15 ? null : pick(random, LAST_NAMES);
    const phoneCount = 1 + Math.floor(random() * 3);
    const phoneNumbers: PhoneNumber[] = [];
    for (let p = 0; p < phoneCount; p++) {
      phoneNumbers.push({ label: p === 0 ? "mobile" : pick(random, PHONE_LABELS), number: phoneNumber(random) });
    }
    contacts.push({
      firstName,
      lastName,
      email: random() < 0.5 ? `${firstName}.${lastName ?? "contact"}${i}@example.com`.toLowerCase().replace(/[^a-z0-9.@]/g, "") : null,
      address: random() < 0.3 ? `${1 + Math.floor(random() * 200)} Main Street` : null,
      notes: null,
      phoneNumbers,
    });
  }
  return contacts;
}
