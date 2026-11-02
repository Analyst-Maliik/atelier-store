export const MAX_QUERY_LENGTH = 80;
export const MAX_TERMS = 5;

/** Trims, collapses whitespace and caps length so cache keys stay bounded. */
export function normalizeQuery(raw: unknown): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

/** Escapes LIKE wildcards (and the escape character itself) so input is matched literally. */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`);
}
