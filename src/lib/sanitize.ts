/**
 * Input sanitization utilities.
 *
 * Strips dangerous content from user-supplied strings:
 *  - HTML tags
 *  - Control characters (except common whitespace)
 *  - Surrogate halves (lone UTF-16 surrogates)
 *
 * Applied automatically in the validate() middleware after Zod parsing.
 */

/** Match HTML tags (e.g. <script>, </div>, <img onerror=...>) */
const HTML_TAG_RE = /<\/?[^>]+(>|$)/g;

/** Match control characters but keep \t (0x09), \n (0x0A), \r (0x0D) */
const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/** Match lone UTF-16 surrogate halves */
const SURROGATE_RE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

/**
 * Sanitize a single string value:
 *  1. Strip lone surrogate halves
 *  2. Strip HTML tags
 *  3. Strip control characters (keeps \t, \n, \r)
 *  4. Normalize whitespace (collapse multiple spaces into one)
 *  5. Trim leading/trailing whitespace
 *  6. Truncate to maxLength if provided
 */
export function sanitizeString(value: string, maxLength?: number): string {
  let cleaned = value;

  cleaned = cleaned.replace(SURROGATE_RE, "");
  cleaned = cleaned.replace(HTML_TAG_RE, "");
  cleaned = cleaned.replace(CONTROL_CHAR_RE, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  if (maxLength !== undefined && cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  return cleaned;
}

/**
 * Field-specific max lengths matching the database schema.
 * Used for automatic truncation during sanitization.
 */
export const FIELD_MAX_LENGTHS: Record<string, number> = {
  external_id: 50,
  company_code: 20,
  branch_code: 20,
  brand: 100,
  model: 100,
  color: 50,
  chassis_number: 50,
  engine_number: 50,
  status: 20,
};

/**
 * Sanitize all string values in an object, applying field-specific max lengths.
 * Non-string values (numbers, booleans, null) pass through unchanged.
 * Nested objects/arrays are NOT recursed into (top-level only).
 */
export function sanitizeObject(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      const maxLen = FIELD_MAX_LENGTHS[key];
      sanitized[key] = sanitizeString(value, maxLen);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
