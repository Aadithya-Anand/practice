import { describe, it, expect } from "vitest";
import { validateBookingLocations } from "./validation";

describe("validateBookingLocations", () => {
  const validPickup = "123 Main St, Chennai";
  const validDrop = "456 Park Ave, Chennai";

  it("returns valid for distinct locations in India", () => {
    const result = validateBookingLocations(
      13.0827, 80.2707, // Chennai
      13.0878, 80.2085, // ~8km away
      validPickup,
      validDrop
    );
    expect(result.valid).toBe(true);
  });

  it("returns invalid for identical pickup and drop", () => {
    const result = validateBookingLocations(
      13.0827, 80.2707,
      13.0827, 80.2707,
      validPickup,
      validDrop
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("50m");
  });

  it("returns invalid for pickup in ocean", () => {
    const result = validateBookingLocations(
      0, 0, // Ocean
      13.0827, 80.2707,
      validPickup,
      validDrop
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("water");
  });

  it("returns invalid for empty pickup address", () => {
    const result = validateBookingLocations(
      13.0827, 80.2707,
      13.0878, 80.2085,
      "",
      validDrop
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Pickup");
  });

  it("returns invalid for invalid coordinates", () => {
    const result = validateBookingLocations(
      100, 200, // Invalid
      13.0827, 80.2707,
      validPickup,
      validDrop
    );
    expect(result.valid).toBe(false);
  });
});
