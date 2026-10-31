"use server";

import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";

export type NewsletterState = {
  status: "idle" | "success" | "error";
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

const SUCCESS: NewsletterState = {
  status: "success",
  message: "Thank you. You are on the list.",
};

/**
 * Receives the signup via POST (server action), so the address never appears
 * in the URL. The email is never logged, and duplicates return the same
 * success message so the response does not reveal who is already subscribed.
 */
export async function subscribeToNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  // Honeypot: real users never see or fill this field.
  if (formData.get("company")) return SUCCESS;

  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  try {
    await db
      .insert(newsletterSubscribers)
      .values({ email })
      .onConflictDoNothing({ target: newsletterSubscribers.email });
  } catch {
    // Deliberately no details: the error could contain the address.
    return {
      status: "error",
      message: "Something went wrong. Please try again later.",
    };
  }

  return SUCCESS;
}
