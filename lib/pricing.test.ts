import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateFare } from "./pricing";

describe("calculateFare", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns base fare + distance for MINI during normal hours", () => {
    vi.setSystemTime(new Date("2025-02-16T14:00:00")); // 2 PM
    const result = calculateFare({ distanceKm: 5, vehicleType: "MINI" });
    expect(result.totalFare).toBe(40 + 5 * 12); // 40 + 60 = 100
    expect(result.surgeApplied).toBe(false);
    expect(result.breakdown.baseFare).toBe(40);
    expect(result.breakdown.distanceFare).toBe(60);
    expect(result.breakdown.perKmRate).toBe(12);
  });

  it("applies night multiplier (10PM-6AM)", () => {
    vi.setSystemTime(new Date("2025-02-16T23:00:00")); // 11 PM
    const result = calculateFare({ distanceKm: 10, vehicleType: "SEDAN" });
    const subtotal = 40 + 10 * 15; // 190
    expect(result.totalFare).toBe(Math.round(subtotal * 1.15));
    expect(result.surgeApplied).toBe(true);
  });

  it("applies peak multiplier (5PM-8PM)", () => {
    vi.setSystemTime(new Date("2025-02-16T18:00:00")); // 6 PM
    const result = calculateFare({ distanceKm: 3, vehicleType: "SUV" });
    const subtotal = 40 + 3 * 20; // 100
    expect(result.totalFare).toBe(Math.round(subtotal * 1.25));
    expect(result.surgeApplied).toBe(true);
  });

  it("throws for negative distance", () => {
    expect(() => calculateFare({ distanceKm: -1, vehicleType: "MINI" })).toThrow(
      "Distance must be non-negative"
    );
  });

  it("handles zero distance", () => {
    vi.setSystemTime(new Date("2025-02-16T14:00:00")); // Normal hours
    const result = calculateFare({ distanceKm: 0, vehicleType: "MINI" });
    expect(result.totalFare).toBeGreaterThanOrEqual(40);
    expect(result.breakdown.baseFare).toBe(40);
  });
});
