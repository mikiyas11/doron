import { z } from "zod";
import { PHONE_LABELS } from "./types";

/**
 * The Contact input rules (PRD FR-10), defined only here (AD-2).
 * Server Actions parse every write with `contactInputSchema`; the form may reuse it.
 */

export const NAME_MAX_LENGTH = 100;
export const ADDRESS_MAX_LENGTH = 300;
export const NOTES_MAX_LENGTH = 2000;
export const MIN_PHONE_NUMBERS = 1;
export const MAX_PHONE_NUMBERS = 5;

/** Spaces, dashes, dots and brackets, which a Phone number may contain for readability. */
const PHONE_SEPARATORS = /[\s\-.()]/g;
/** An optional "+" and 3 to 15 digits, once separators are removed. */
const PHONE_PATTERN = /^\+?\d{3,15}$/;
/** name@domain: no spaces, exactly one "@" with something on each side. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

export function isValidPhoneNumber(value: string): boolean {
  return PHONE_PATTERN.test(value.replace(PHONE_SEPARATORS, ""));
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export const MESSAGES = {
  firstNameRequired: "Enter a first name.",
  firstNameTooLong: `First name must be ${NAME_MAX_LENGTH} characters or fewer.`,
  lastNameTooLong: `Last name must be ${NAME_MAX_LENGTH} characters or fewer.`,
  email: "Enter an Email like name@domain.",
  addressTooLong: `Address must be ${ADDRESS_MAX_LENGTH} characters or fewer.`,
  notesTooLong: `Notes must be ${NOTES_MAX_LENGTH.toLocaleString("en-US")} characters or fewer.`,
  phoneNumber: "Enter a Phone number of 3 to 15 digits, optionally starting with +.",
  phoneLabel: "Choose Mobile, Home, Work or Other.",
  tooFewPhoneNumbers: "Add at least one Phone number.",
  tooManyPhoneNumbers: `A Contact can have at most ${MAX_PHONE_NUMBERS} Phone numbers.`,
} as const;

const phoneNumberSchema = z.object({
  label: z.enum(PHONE_LABELS, MESSAGES.phoneLabel),
  number: z.string().trim().refine(isValidPhoneNumber, MESSAGES.phoneNumber),
});

export const contactInputSchema = z.object({
  firstName: z.string().trim().min(1, MESSAGES.firstNameRequired).max(NAME_MAX_LENGTH, MESSAGES.firstNameTooLong),
  lastName: z.string().trim().max(NAME_MAX_LENGTH, MESSAGES.lastNameTooLong),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || isValidEmail(value), MESSAGES.email),
  address: z.string().trim().max(ADDRESS_MAX_LENGTH, MESSAGES.addressTooLong),
  notes: z.string().trim().max(NOTES_MAX_LENGTH, MESSAGES.notesTooLong),
  phoneNumbers: z
    .array(phoneNumberSchema)
    .min(MIN_PHONE_NUMBERS, MESSAGES.tooFewPhoneNumbers)
    .max(MAX_PHONE_NUMBERS, MESSAGES.tooManyPhoneNumbers),
});

/** What the owner typed, as the form submits it. Echoed back on failure so the form keeps it. */
export type ContactInput = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  notes: string;
  phoneNumbers: { label: string; number: string }[];
};

/** Input that passed `contactInputSchema`: trimmed, with known Labels. */
export type ValidContactInput = z.output<typeof contactInputSchema>;

/** Field error keys are the schema paths joined with ".", e.g. `firstName` or `phoneNumbers.0.number`. */
export type FieldErrors = Record<string, string>;

/** What a Contact Server Action returns when it does not save (AD-2). On success it redirects instead. */
export type ActionResult = {
  ok: false;
  fieldErrors?: FieldErrors;
  formError?: string;
  duplicate?: { contactId: string; name: string };
  values: ContactInput;
};

/** A Server Action as `ContactForm` calls it through `useActionState`. */
export type ContactFormAction = (previous: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export const SAVE_FAILED_MESSAGE = "Could not save. Try again.";

export const EMPTY_CONTACT_INPUT: ContactInput = {
  firstName: "",
  lastName: "",
  email: "",
  address: "",
  notes: "",
  phoneNumbers: [{ label: "mobile", number: "" }],
};

/** Form field names; Phone numbers repeat `phoneLabel` and `phoneNumber` once per row, in order. */
export const FIELD_NAMES = {
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  address: "address",
  notes: "notes",
  phoneLabel: "phoneLabel",
  phoneNumber: "phoneNumber",
} as const;

function text(value: FormDataEntryValue | null | undefined): string {
  return typeof value === "string" ? value : "";
}

/** Reads the Contact form's fields exactly as typed. */
export function contactFormValues(formData: FormData): ContactInput {
  const labels = formData.getAll(FIELD_NAMES.phoneLabel);
  const numbers = formData.getAll(FIELD_NAMES.phoneNumber);
  return {
    firstName: text(formData.get(FIELD_NAMES.firstName)),
    lastName: text(formData.get(FIELD_NAMES.lastName)),
    email: text(formData.get(FIELD_NAMES.email)),
    address: text(formData.get(FIELD_NAMES.address)),
    notes: text(formData.get(FIELD_NAMES.notes)),
    phoneNumbers: Array.from({ length: Math.max(labels.length, numbers.length) }, (_, index) => ({
      label: text(labels[index]),
      number: text(numbers[index]),
    })),
  };
}

/** The first message for each invalid field, keyed by its path. */
export function fieldErrorsFrom(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}

export type ValidationResult = { success: true; data: ValidContactInput } | { success: false; fieldErrors: FieldErrors };

/** Validates typed input against the FR-10 rules. */
export function validateContactInput(input: ContactInput): ValidationResult {
  const parsed = contactInputSchema.safeParse(input);
  return parsed.success ? { success: true, data: parsed.data } : { success: false, fieldErrors: fieldErrorsFrom(parsed.error) };
}
