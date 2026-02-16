/**
 * Pricing Engine - Centralized fare calculation
 * Supports base fare, per-km rates, time-based multipliers
 */

export type VehicleType = "MINI" | "SEDAN" | "SUV";

export interface PricingInput {
  distanceKm: number;
  vehicleType: VehicleType;
  /** Optional timestamp for surge - defaults to now */
  timestamp?: Date;
}

export interface PricingBreakdown {
  baseFare: number;
  distanceFare: number;
  distanceKm: number;
  perKmRate: number;
  timeMultiplier: number;
  timeMultiplierLabel?: string;
  surgeApplied: boolean;
}

export interface PricingResult {
  totalFare: number;
  breakdown: PricingBreakdown;
  surgeApplied: boolean;
}

// Base constants
const BASE_FARE = 40;
const PER_KM_RATES: Record<VehicleType, number> = {
  MINI: 12,
  SEDAN: 15,
  SUV: 20,
};

// Time windows (local time)
const NIGHT_START = 22; // 10 PM
const NIGHT_END = 6; // 6 AM
const PEAK_START = 17; // 5 PM
const PEAK_END = 20; // 8 PM
const NIGHT_MULTIPLIER = 1.15;
const PEAK_MULTIPLIER = 1.25;

/**
 * Validates coordinates are within valid lat/lng range
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Gets time multiplier based on hour (0-23)
 */
function getTimeMultiplier(hour: number): { multiplier: number; label?: string } {
  const isNight = hour >= NIGHT_START || hour < NIGHT_END;
  const isPeak = hour >= PEAK_START && hour < PEAK_END;

  if (isPeak) return { multiplier: PEAK_MULTIPLIER, label: "Peak hours (5PM-8PM)" };
  if (isNight) return { multiplier: NIGHT_MULTIPLIER, label: "Night hours (10PM-6AM)" };
  return { multiplier: 1, label: undefined };
}

/**
 * Calculate fare with surge pricing
 */
export function calculateFare(input: PricingInput): PricingResult {
  const { distanceKm, vehicleType, timestamp = new Date() } = input;

  if (distanceKm < 0) {
    throw new Error("Distance must be non-negative");
  }

  const perKmRate = PER_KM_RATES[vehicleType] ?? PER_KM_RATES.MINI;
  const { multiplier: timeMultiplier, label: timeMultiplierLabel } = getTimeMultiplier(
    timestamp.getHours()
  );

  const baseFare = BASE_FARE;
  const distanceFare = distanceKm * perKmRate;
  const subtotal = baseFare + distanceFare;
  const totalFare = Math.round(subtotal * timeMultiplier);

  return {
    totalFare,
    surgeApplied: timeMultiplier > 1,
    breakdown: {
      baseFare,
      distanceFare: Math.round(distanceFare * 100) / 100,
      distanceKm,
      perKmRate,
      timeMultiplier,
      timeMultiplierLabel,
      surgeApplied: timeMultiplier > 1,
    },
  };
}
