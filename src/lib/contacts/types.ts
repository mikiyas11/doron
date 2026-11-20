export const PHONE_LABELS = ["mobile", "home", "work", "other"] as const;

export type PhoneLabel = (typeof PHONE_LABELS)[number];

export const PHONE_LABEL_TEXT: Record<PhoneLabel, string> = {
  mobile: "Mobile",
  home: "Home",
  work: "Work",
  other: "Other",
};

export type PhoneNumber = {
  label: PhoneLabel;
  number: string;
};

/** One row of the Contact list: the Name and the first Phone number. */
export type ContactListItem = {
  id: string;
  firstName: string;
  lastName: string | null;
  sortKey: string;
  firstPhone: PhoneNumber | null;
};

/** Data accepted by the repository's insert helper (used by the seed script and tests). */
export type NewContactData = {
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  phoneNumbers: PhoneNumber[];
};
