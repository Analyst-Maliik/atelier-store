"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { allowAttempt, clientIp, emailKey } from "@/lib/rate-limit";
import { safeNext } from "@/lib/safe-redirect";
import { validate, type AuthState } from "@/lib/auth-validation";

const THROTTLED_MESSAGE = "Too many attempts. Please wait a moment and try again.";
const GENERIC_MESSAGE = "Something went wrong. Please try again.";

function formError(message: string, values: AuthState["values"]): AuthState {
  return { status: "error", message, values };
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function failure(error: unknown, values: AuthState["values"]): AuthState {
  if (error instanceof APIError && error.statusCode === 429) {
    return formError(THROTTLED_MESSAGE, values);
  }
  // Deliberately no error details: they can contain the address or credentials.
  return formError(GENERIC_MESSAGE, values);
}

/** Credentials are only ever read from a POSTed form, never from the URL. */
export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = text(formData, "name").trim();
  const email = text(formData, "email").trim().toLowerCase();
  const password = text(formData, "password");
  const values = { name, email };

  const fieldErrors = validate("sign-up", { name, email, password });
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "", fieldErrors, values };
  }

  try {
    if (!(await allowAttempt(`action:sign-up:ip:${await clientIp()}`, 5, 60))) {
      return formError(THROTTLED_MESSAGE, values);
    }
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError && error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
      return {
        status: "error",
        message: "",
        fieldErrors: { email: "An account with this email already exists. Try signing in." },
        values,
      };
    }
    return failure(error, values);
  }

  redirect(safeNext(text(formData, "next")));
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email").trim().toLowerCase();
  const password = text(formData, "password");
  const values = { email };

  const fieldErrors = validate("sign-in", { name: "", email, password });
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "", fieldErrors, values };
  }

  try {
    const ipOk = await allowAttempt(`action:sign-in:ip:${await clientIp()}`, 20, 60);
    const emailOk = await allowAttempt(`action:sign-in:email:${emailKey(email)}`, 5, 60);
    if (!ipOk || !emailOk) return formError(THROTTLED_MESSAGE, values);
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 429) return failure(error, values);
    // Same message for unknown email, wrong password and banned accounts.
    return formError("Invalid email or password. Please check your details and try again.", values);
  }

  redirect(safeNext(text(formData, "next")));
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
