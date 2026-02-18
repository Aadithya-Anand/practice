import { describe, it, expect } from "vitest";
import { formatBuildingAddress } from "./geocoding";

describe("formatBuildingAddress", () => {
  it("formats house number and road", () => {
    const addr = { house_number: "3B", road: "Lakshmi Street" };
    expect(formatBuildingAddress(addr)).toBe("3B, Lakshmi Street");
  });

  it("formats road only when no house number", () => {
    const addr = { road: "Anna Nagar Main Road" };
    expect(formatBuildingAddress(addr)).toBe("Anna Nagar Main Road");
  });

  it("includes building and apartment", () => {
    const addr = {
      road: "Adyar",
      building: "Lakshmi Apartments",
      apartment: "Flat 3B",
    };
    expect(formatBuildingAddress(addr)).toContain("Lakshmi Apartments");
    expect(formatBuildingAddress(addr)).toContain("Flat 3B");
  });

  it("handles array values", () => {
    const addr = { road: ["Main Road"], city: ["Chennai"] };
    expect(formatBuildingAddress(addr)).toContain("Main Road");
    expect(formatBuildingAddress(addr)).toContain("Chennai");
  });

  it("returns empty string for empty address", () => {
    expect(formatBuildingAddress({})).toBe("");
  });
});
