"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as repository from "@/lib/contacts/repository";
import {
  contactFormValues,
  SAVE_FAILED_MESSAGE,
  validateContactInput,
  type ActionResult,
} from "@/lib/contacts/schema";

/**
 * The Contact Server Actions (AD-2). Each validates with `contactInputSchema` and, when it does not
 * save, returns an `ActionResult` echoing what was typed. They never throw to the UI.
 */

/** Adds a Contact (FR-7), then opens its details. */
export async function createContact(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const values = contactFormValues(formData);
  const validation = validateContactInput(values);
  if (!validation.success) {
    return { ok: false, fieldErrors: validation.fieldErrors, values };
  }

  let id: string;
  try {
    id = repository.createContact(validation.data);
  } catch (error) {
    console.error("createContact failed", error);
    return { ok: false, formError: SAVE_FAILED_MESSAGE, values };
  }

  revalidatePath("/");
  redirect(`/contacts/${id}`);
}
