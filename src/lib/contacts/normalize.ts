/**
 * Search and sort keys (AD-3). The repository derives every stored key with these helpers.
 */

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

/** NFD, diacritics stripped, lower-cased, trimmed: "  José " → "jose". */
export function textKey(s: string): string {
  return s.normalize("NFD").replace(COMBINING_DIACRITICS, "").toLowerCase().trim();
}

/** Digits only; spaces, dashes, dots, brackets and "+" are dropped: "+1 (555) 012-3456" → "15550123456". */
export function phoneDigits(s: string): string {
  return s.replace(/\D/g, "");
}

/** `textKey(last_name || first_name) + ' ' + textKey(first_name)` (Architecture spine, structural seed). */
export function sortKey(firstName: string, lastName?: string | null): string {
  const last = lastName && lastName.trim() !== "" ? lastName : firstName;
  return `${textKey(last)} ${textKey(firstName)}`;
}

/** The text that name searches match against: first and last name. */
export function searchName(firstName: string, lastName?: string | null): string {
  return textKey([firstName, lastName ?? ""].join(" "));
}
