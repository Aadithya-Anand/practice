import { describe, it, expect } from "vitest";
import { sanitizeAddress } from "./sanitize";

describe("sanitizeAddress", () => {
  it("trims whitespace", () => {
    expect(sanitizeAddress("  123 Main St  ")).toBe("123 Main St");
  });

  it("removes dangerous characters", () => {
    expect(sanitizeAddress("123<script>Main</script>")).toBe("123scriptMainscript");
    expect(sanitizeAddress('test"quotes\'')).not.toContain('"');
    expect(sanitizeAddress("test\\backslash")).not.toContain("\\");
  });

  it("collapses multiple spaces", () => {
    expect(sanitizeAddress("123   Main    St")).toBe("123 Main St");
  });

  it("returns empty for non-string", () => {
    expect(sanitizeAddress(null as unknown as string)).toBe("");
    expect(sanitizeAddress(123 as unknown as string)).toBe("");
  });

  it("limits length to 500", () => {
    const long = "a".repeat(600);
    expect(sanitizeAddress(long).length).toBe(500);
  });
});
