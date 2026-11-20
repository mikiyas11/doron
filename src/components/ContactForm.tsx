"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import {
  EMPTY_CONTACT_INPUT,
  FIELD_NAMES,
  MAX_PHONE_NUMBERS,
  MIN_PHONE_NUMBERS,
  type ActionResult,
  type ContactFormAction,
  type ContactInput,
} from "@/lib/contacts/schema";
import { PHONE_LABEL_TEXT, PHONE_LABELS } from "@/lib/contacts/types";

/**
 * The add/edit Contact form (FR-7, FR-9, FR-10). Shared by add and edit: the page passes the
 * Server Action and the initial values. Inputs are controlled, so a refused or failed save keeps
 * everything the owner typed.
 */

export type ContactFormProps = {
  action: ContactFormAction;
  initialValues?: ContactInput;
  submitLabel?: string;
  cancelHref?: string;
};

type TextFieldName = "firstName" | "lastName" | "email" | "address" | "notes";
type TextFields = Record<TextFieldName, string>;
type PhoneRow = { key: number; label: string; number: string };

const DEFAULT_LABEL = "mobile";

/** The id of the control an error key refers to, so the summary can link to it. */
function controlId(errorKey: string): string {
  const phone = /^phoneNumbers\.(\d+)\.(label|number)$/.exec(errorKey);
  if (phone) return phoneControlId(Number(phone[1]), phone[2] as "label" | "number");
  if (errorKey === "phoneNumbers") return phoneControlId(0, "number");
  return `contact-${errorKey}`;
}

function phoneControlId(index: number, part: "label" | "number"): string {
  return `contact-phone-${index}-${part}`;
}

function errorId(id: string): string {
  return `${id}-error`;
}

const controlClass =
  "min-w-0 rounded-md border border-gray-300 px-3 py-2 text-base focus-visible:border-blue-700 focus-visible:outline-2 focus-visible:outline-blue-700 aria-[invalid=true]:border-red-600";
const inputClass = `mt-1 block w-full ${controlClass}`;
const buttonClass =
  "inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

export function ContactForm({
  action,
  initialValues = EMPTY_CONTACT_INPUT,
  submitLabel = "Save",
  cancelHref = "/",
}: ContactFormProps) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null);
  const [fields, setFields] = useState<TextFields>(() => ({
    firstName: initialValues.firstName,
    lastName: initialValues.lastName,
    email: initialValues.email,
    address: initialValues.address,
    notes: initialValues.notes,
  }));
  const [phones, setPhones] = useState<PhoneRow[]>(() => {
    const initial = initialValues.phoneNumbers.length > 0 ? initialValues.phoneNumbers : EMPTY_CONTACT_INPUT.phoneNumbers;
    return initial.map((phone, key) => ({ key, ...phone }));
  });
  // Re-keys the error summary on each save, so screen readers announce it again.
  const [submission, setSubmission] = useState(0);

  const fieldErrors = state?.fieldErrors ?? {};
  const errorEntries = Object.entries(fieldErrors);
  const formError = state?.formError;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Submitting by hand keeps React from resetting the form after the action (values must stay).
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmission((count) => count + 1);
    startTransition(() => formAction(formData));
  }

  function setField(name: TextFieldName, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
  }

  function updatePhone(key: number, change: Partial<Omit<PhoneRow, "key">>) {
    setPhones((current) => current.map((phone) => (phone.key === key ? { ...phone, ...change } : phone)));
  }

  function addPhone() {
    setPhones((current) =>
      current.length >= MAX_PHONE_NUMBERS
        ? current
        : [...current, { key: Math.max(-1, ...current.map((phone) => phone.key)) + 1, label: DEFAULT_LABEL, number: "" }],
    );
  }

  function removePhone(key: number) {
    setPhones((current) => (current.length <= MIN_PHONE_NUMBERS ? current : current.filter((phone) => phone.key !== key)));
  }

  const textField = (name: TextFieldName, label: string, options: { type?: string; autoComplete?: string; multiline?: boolean; required?: boolean } = {}) => (
    <TextField
      id={controlId(name)}
      name={FIELD_NAMES[name]}
      label={label}
      value={fields[name]}
      onChange={(value) => setField(name, value)}
      error={fieldErrors[name]}
      {...options}
    />
  );

  const phonesError = fieldErrors.phoneNumbers;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Contact" className="space-y-5 px-4 py-5">
      {(formError || errorEntries.length > 0) && (
        <div
          key={submission}
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {formError ? (
            <p className="font-medium">{formError}</p>
          ) : (
            <>
              <p className="font-medium">
                The Contact was not saved. Fix {errorEntries.length === 1 ? "this problem" : `these ${errorEntries.length} problems`}:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {errorEntries.map(([key, message]) => (
                  <li key={key}>
                    <a href={`#${controlId(key)}`} className="underline">
                      {message}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {textField("firstName", "First name", { autoComplete: "given-name", required: true })}
      {textField("lastName", "Last name", { autoComplete: "family-name" })}

      <fieldset aria-describedby={phonesError ? "contact-phones-error" : undefined}>
        <legend className="text-sm font-medium">Phone numbers</legend>
        {phonesError && (
          <p id="contact-phones-error" className="mt-1 text-sm text-red-700">
            {phonesError}
          </p>
        )}
        <ol className="mt-2 space-y-3">
          {phones.map((phone, index) => {
            const position = index + 1;
            const labelId = phoneControlId(index, "label");
            const numberId = phoneControlId(index, "number");
            const labelError = fieldErrors[`phoneNumbers.${index}.label`];
            const numberError = fieldErrors[`phoneNumbers.${index}.number`];
            const describedBy = [labelError && errorId(labelId), numberError && errorId(numberId)].filter(Boolean).join(" ");
            return (
              <li key={phone.key} data-testid="phone-row">
                <label htmlFor={numberId} className="block text-sm font-medium">
                  Phone number {position}
                </label>
                <div className="mt-1 flex items-start gap-2">
                  <label htmlFor={labelId} className="sr-only">
                    Label for Phone number {position}
                  </label>
                  <select
                    id={labelId}
                    name={FIELD_NAMES.phoneLabel}
                    value={phone.label}
                    onChange={(event) => updatePhone(phone.key, { label: event.target.value })}
                    aria-invalid={labelError ? true : undefined}
                    aria-describedby={labelError ? errorId(labelId) : undefined}
                    className="shrink-0 rounded-md border border-gray-300 bg-white px-2 py-2 text-base focus-visible:outline-2 focus-visible:outline-blue-700 aria-[invalid=true]:border-red-600"
                  >
                    {PHONE_LABELS.map((label) => (
                      <option key={label} value={label}>
                        {PHONE_LABEL_TEXT[label]}
                      </option>
                    ))}
                  </select>
                  <input
                    id={numberId}
                    name={FIELD_NAMES.phoneNumber}
                    type="tel"
                    autoComplete="tel"
                    value={phone.number}
                    onChange={(event) => updatePhone(phone.key, { number: event.target.value })}
                    aria-invalid={numberError ? true : undefined}
                    aria-describedby={describedBy || undefined}
                    className={`${controlClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removePhone(phone.key)}
                    disabled={phones.length <= MIN_PHONE_NUMBERS}
                    aria-label={`Remove Phone number ${position}`}
                    className={`${buttonClass} shrink-0`}
                  >
                    Remove
                  </button>
                </div>
                {labelError && (
                  <p id={errorId(labelId)} className="mt-1 text-sm text-red-700">
                    {labelError}
                  </p>
                )}
                {numberError && (
                  <p id={errorId(numberId)} className="mt-1 text-sm text-red-700">
                    {numberError}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          onClick={addPhone}
          disabled={phones.length >= MAX_PHONE_NUMBERS}
          className={`${buttonClass} mt-3`}
        >
          Add Phone number
        </button>
      </fieldset>

      {textField("email", "Email", { type: "email", autoComplete: "email" })}
      {textField("address", "Address", { autoComplete: "street-address", multiline: true })}
      {textField("notes", "Notes", { multiline: true })}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <a href={cancelHref} className="text-sm font-medium text-blue-700 underline">
          Cancel
        </a>
      </div>
    </form>
  );
}

type TextFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  multiline?: boolean;
  required?: boolean;
};

function TextField({ id, name, label, value, onChange, error, type = "text", autoComplete, multiline, required }: TextFieldProps) {
  const shared = {
    id,
    name,
    value,
    required,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId(id) : undefined,
    className: inputClass,
  };
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {multiline ? (
        <textarea rows={3} {...shared} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input type={type} {...shared} onChange={(event) => onChange(event.target.value)} />
      )}
      {error && (
        <p id={errorId(id)} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
