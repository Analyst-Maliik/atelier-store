// Better Auth only warns about short or low-entropy secrets. The secret signs
// HS256 email-verification tokens and session cookies, so a guessable value
// lets an attacker forge them. Fail closed instead of warning.

const MIN_LENGTH = 32;
const MIN_UNIQUE_CHARS = 12;

// The library's built-in fallback is public, so it must never be accepted.
const KNOWN_WEAK = new Set([
  "better-auth-secret-12345678901234567890",
  "secret",
  "changeme",
  "password",
]);

export function getAuthSecret(
  value: string | undefined = process.env.BETTER_AUTH_SECRET,
): string {
  const secret = value?.trim();

  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is not set. Generate one with `openssl rand -base64 32`.",
    );
  }
  if (KNOWN_WEAK.has(secret.toLowerCase())) {
    throw new Error("BETTER_AUTH_SECRET is a known default or weak value.");
  }
  if (secret.length < MIN_LENGTH) {
    throw new Error(
      `BETTER_AUTH_SECRET must be at least ${MIN_LENGTH} characters (got ${secret.length}). Generate one with \`openssl rand -base64 32\`.`,
    );
  }
  if (new Set(secret).size < MIN_UNIQUE_CHARS) {
    throw new Error(
      "BETTER_AUTH_SECRET looks repetitive or guessable. Generate one with `openssl rand -base64 32`.",
    );
  }
  return secret;
}
