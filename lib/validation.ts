/**
 * Geospatial validation - coordinates, ocean check, duplicate prevention
 */

// Approximate land boundaries - simplified check (not exhaustive)
// For production, use a proper point-in-polygon library or external service
const INDIA_BOUNDS = {
  minLat: 8.0,
  maxLat: 35.5,
  minLng: 68.0,
  maxLng: 97.5,
};

/** Minimum distance in meters to consider pickup and drop as distinct */
const MIN_POINT_DISTANCE_M = 50;

/**
 * Check if coordinates are within valid lat/lng range
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Reject coordinates in ocean - basic India bounds check
 * Returns true if point appears to be on land (within India)
 */
export function isOnLand(lat: number, lng: number): boolean {
  if (!isValidCoordinate(lat, lng)) return false;
  return (
    lat >= INDIA_BOUNDS.minLat &&
    lat <= INDIA_BOUNDS.maxLat &&
    lng >= INDIA_BOUNDS.minLng &&
    lng <= INDIA_BOUNDS.maxLng
  );
}

/**
 * Haversine distance in meters
 */
function haversineDistanceM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Ensure pickup and drop are not identical (or too close)
 */
export function arePointsDistinct(
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number
): boolean {
  const dist = haversineDistanceM(pickupLat, pickupLng, dropLat, dropLng);
  return dist >= MIN_POINT_DISTANCE_M;
}

/**
 * Full validation for booking
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateBookingLocations(
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number,
  pickupAddress: string,
  dropAddress: string
): ValidationResult {
  if (!isValidCoordinate(pickupLat, pickupLng)) {
    return { valid: false, error: "Invalid pickup coordinates" };
  }
  if (!isValidCoordinate(dropLat, dropLng)) {
    return { valid: false, error: "Invalid drop coordinates" };
  }
  if (!isOnLand(pickupLat, pickupLng)) {
    return { valid: false, error: "Pickup location appears to be in water or outside service area" };
  }
  if (!isOnLand(dropLat, dropLng)) {
    return { valid: false, error: "Drop location appears to be in water or outside service area" };
  }
  if (!arePointsDistinct(pickupLat, pickupLng, dropLat, dropLng)) {
    return { valid: false, error: "Pickup and drop must be at least 50m apart" };
  }
  if (!pickupAddress?.trim()) {
    return { valid: false, error: "Pickup address is required" };
  }
  if (!dropAddress?.trim()) {
    return { valid: false, error: "Drop address is required" };
  }
  return { valid: true };
}
