/**
 * Input sanitization for address strings
 */

const MAX_ADDRESS_LENGTH = 500;

/** Remove potentially dangerous characters, trim, limit length */
export function sanitizeAddress(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>'"`\\/]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_ADDRESS_LENGTH);
}
