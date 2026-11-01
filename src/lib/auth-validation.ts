// Pure validators shared by the server actions (authoritative) and the form
// (instant feedback). Safe to import from client components.

export const MIN_PASSWORD = 10;
export const MAX_PASSWORD = 128;
export const MAX_NAME = 100;
export const MAX_EMAIL = 254;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Field = "name" | "email" | "password";
export type FieldErrors = Partial<Record<Field, string>>;

export type AuthState = {
  status: "idle" | "error";
  /** Form-level problem (bad credentials, throttled, unexpected). Empty when only fields are wrong. */
  message: string;
  fieldErrors?: FieldErrors;
  /** Echoed back so the form keeps what was typed. Never contains the password. */
  values?: { name?: string; email?: string };
};

export type Mode = "sign-in" | "sign-up";

export function validateField(
  field: Field,
  value: string,
  mode: Mode,
): string | undefined {
  switch (field) {
    case "name": {
      const v = value.trim();
      if (!v) return "Please enter your name.";
      if (v.length > MAX_NAME) return `Use ${MAX_NAME} characters or fewer.`;
      return undefined;
    }
    case "email": {
      const v = value.trim();
      if (!v) return "Please enter your email address.";
      if (v.length > MAX_EMAIL || !EMAIL_PATTERN.test(v)) {
        return "Please enter a valid email address, such as name@example.com.";
      }
      return undefined;
    }
    case "password": {
      if (!value) return "Please enter your password.";
      if (value.length > MAX_PASSWORD) return `Use ${MAX_PASSWORD} characters or fewer.`;
      // The policy is only enforced (and shown) on sign-up, never revealed on sign-in.
      if (mode === "sign-up" && value.length < MIN_PASSWORD) {
        const missing = MIN_PASSWORD - value.length;
        return `Add ${missing} more character${missing === 1 ? "" : "s"}: use at least ${MIN_PASSWORD}.`;
      }
      return undefined;
    }
  }
}

export function fieldsFor(mode: Mode): Field[] {
  return mode === "sign-up" ? ["name", "email", "password"] : ["email", "password"];
}

export function validate(
  mode: Mode,
  values: Record<Field, string>,
): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of fieldsFor(mode)) {
    const error = validateField(field, values[field] ?? "", mode);
    if (error) errors[field] = error;
  }
  return errors;
}
