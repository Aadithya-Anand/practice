/**
 * Centralized type definitions for Vandi ride-booking app
 */

export type VehicleType = "MINI" | "SEDAN" | "SUV";

export interface MapLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
  rawAddress: Record<string, string> | null;
}

export interface BookingRequest {
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
  pickupAddress: string;
  dropAddress: string;
  pickupAddressRaw?: Record<string, unknown>;
  dropAddressRaw?: Record<string, unknown>;
  distanceKm: number;
  durationMin: number;
  fare: number;
  vehicleType: VehicleType;
  rideNotes?: string;
  scheduledAt?: string | null;
  promoCode?: string;
}

export interface Trip {
  id: string;
  userId: string | null;
  driverId?: string | null;
  driver?: { id: string; email: string; driverProfile?: { name: string; vehicleType: string; vehicleNumber: string; rating: number } } | null;
  rideNotes?: string | null;
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
  pickupAddress: string;
  dropAddress: string;
  pickupAddressRaw: Record<string, unknown> | null;
  dropAddressRaw: Record<string, unknown> | null;
  distanceKm: number;
  durationMin: number;
  fare: number;
  vehicleType: string;
  status: TripStatus;
  createdAt: string;
  rating?: { id: string; stars: number } | null;
}

export type TripStatus =
  | "SEARCHING"
  | "ACCEPTED"
  | "ARRIVING"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";

export interface MapData {
  pickupLat: number | null;
  pickupLng: number | null;
  dropLat: number | null;
  dropLng: number | null;
  pickupAddress: string;
  dropAddress: string;
  pickupAddressRaw: Record<string, string> | null;
  dropAddressRaw: Record<string, string> | null;
  pickupManuallyAdjusted: boolean;
  dropManuallyAdjusted: boolean;
  distance: number | null;
  durationMin: number | null;
  fare: number | null;
  mapZoom: number;
  validationError: string | null;
  rideNotes?: string;
  scheduledAt?: string | null;
  promoCode?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role?: "rider" | "driver";
  driverProfile?: {
    id: string;
    name: string;
    vehicleType: string;
    vehicleNumber: string;
    isOnline: boolean;
    rating: number;
  };
}

export interface ApiError {
  error: string;
  details?: unknown;
}
