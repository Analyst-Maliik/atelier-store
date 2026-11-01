/**
 * Only same-site paths are allowed as a post-login destination. Rejects absolute
 * URLs, protocol-relative `//host` and backslash tricks, so `?next=` cannot be
 * used as an open redirect.
 */
export function safeNext(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
