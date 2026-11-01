"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { signIn, signUp } from "@/app/actions/auth";
import {
  MAX_EMAIL,
  MAX_NAME,
  MAX_PASSWORD,
  MIN_PASSWORD,
  fieldsFor,
  validate,
  validateField,
  type AuthState,
  type Field,
  type FieldErrors,
  type Mode,
} from "@/lib/auth-validation";

const initialState: AuthState = { status: "idle", message: "" };

const copy = {
  "sign-in": { submit: "Sign in", pending: "Signing in…" },
  "sign-up": { submit: "Create account", pending: "Creating account…" },
} as const;

type Props = {
  mode: Mode;
  /** Already sanitised same-site path to return to after authenticating. */
  next: string;
};

type TextFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: React.ReactNode;
  children: (aria: { "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
};

/** Label, control, optional hint and inline error, wired together for assistive tech. */
function TextField({ id, label, error, hint, children }: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-3 block">
        {label}
      </label>
      {children({ "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-small text-accent">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-muted mt-2 text-small">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function AuthForm({ mode, next }: Props) {
  const isSignUp = mode === "sign-up";
  const [state, formAction, pending] = useActionState(
    isSignUp ? signUp : signIn,
    initialState,
  );

  // Errors found in the browser. Reset whenever a fresh server response arrives
  // (derived-state pattern), so server errors show until the user edits the field.
  const [seen, setSeen] = useState(state);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  if (seen !== state) {
    setSeen(state);
    setClientErrors({});
  }

  const [showPassword, setShowPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(0);
  const inputs = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});

  const errorFor = (field: Field): string | undefined =>
    field in clientErrors ? clientErrors[field] : state.fieldErrors?.[field];

  function checkField(field: Field, value: string) {
    setClientErrors((prev) => ({ ...prev, [field]: validateField(field, value, mode) }));
  }

  // After a server response, move focus to what needs fixing.
  useEffect(() => {
    if (state.status !== "error") return;
    const firstInvalid = fieldsFor(mode).find((f) => state.fieldErrors?.[f]);
    // Credential/throttle errors have no field: send people back to the password.
    inputs.current[firstInvalid ?? "password"]?.focus();
  }, [state, mode]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const values = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    };
    const errors = validate(mode, values);
    const invalid = fieldsFor(mode).filter((f) => errors[f]);
    if (invalid.length === 0) return; // valid: let the server action run
    event.preventDefault();
    setClientErrors(errors);
    inputs.current[invalid[0]]?.focus();
  }

  const nextQuery = next === "/account" ? "" : `?next=${encodeURIComponent(next)}`;
  const passwordOk = isSignUp && passwordLength >= MIN_PASSWORD;

  return (
    // A function action always submits as POST (React sets the method), so credentials
    // never end up in a URL or browser history. Do not add method/encType props here.
    <form
      action={formAction}
      onSubmit={onSubmit}
      className="flex flex-col gap-8"
      noValidate
      aria-busy={pending}
    >
      <input type="hidden" name="next" value={next} />

      {state.message && (
        <p role="alert" className="border border-accent px-4 py-3 text-small text-accent">
          {state.message}
        </p>
      )}

      <fieldset
        disabled={pending}
        className="m-0 flex min-w-0 flex-col gap-8 border-0 p-0 transition-opacity disabled:opacity-60"
      >
        {isSignUp && (
          <TextField id="auth-name" label="Name" error={errorFor("name")}>
            {(aria) => (
              <input
                {...aria}
                ref={(el) => {
                  inputs.current.name = el;
                }}
                id="auth-name"
                name="name"
                type="text"
                required
                maxLength={MAX_NAME}
                autoComplete="name"
                defaultValue={state.values?.name}
                onBlur={(e) => checkField("name", e.currentTarget.value)}
                onChange={(e) => errorFor("name") && checkField("name", e.currentTarget.value)}
                className="field"
              />
            )}
          </TextField>
        )}

        <TextField id="auth-email" label="Email" error={errorFor("email")}>
          {(aria) => (
            <input
              {...aria}
              ref={(el) => {
                inputs.current.email = el;
              }}
              id="auth-email"
              name="email"
              type="email"
              required
              maxLength={MAX_EMAIL}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              defaultValue={state.values?.email}
              onBlur={(e) => checkField("email", e.currentTarget.value)}
              onChange={(e) => errorFor("email") && checkField("email", e.currentTarget.value)}
              className="field"
            />
          )}
        </TextField>

        <TextField
          id="auth-password"
          label="Password"
          error={errorFor("password")}
          hint={
            isSignUp
              ? passwordOk
                ? "Long enough."
                : `At least ${MIN_PASSWORD} characters.`
              : undefined
          }
        >
          {(aria) => (
            <div className="relative">
              <input
                {...aria}
                ref={(el) => {
                  inputs.current.password = el;
                }}
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                maxLength={MAX_PASSWORD}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                autoCapitalize="none"
                spellCheck={false}
                onBlur={(e) => checkField("password", e.currentTarget.value)}
                onChange={(e) => {
                  setPasswordLength(e.currentTarget.value.length);
                  if (errorFor("password")) checkField("password", e.currentTarget.value);
                }}
                className="field pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="eyebrow absolute inset-y-0 right-0 px-1"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          )}
        </TextField>
      </fieldset>

      <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
        {pending ? copy[mode].pending : copy[mode].submit}
      </button>

      <p className="text-muted text-small">
        {isSignUp ? "Already have an account? " : "New to Atelier? "}
        <Link
          href={`${isSignUp ? "/sign-in" : "/sign-up"}${nextQuery}`}
          className="link"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
