/**
 * API Services Layer - Centralized fetch logic
 * No business logic in UI components
 */

const API_BASE = ""; // Same origin

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return data as T;
}

export interface CreateTripPayload {
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
  vehicleType: string;
}

export interface Trip {
  id: string;
  userId: string | null;
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
  status: string;
  createdAt: string;
  rating?: { id: string; stars: number } | null;
}

export const tripsApi = {
  async create(payload: CreateTripPayload): Promise<{ trip: Trip }> {
    const res = await fetch(`${API_BASE}/api/trips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    return handleResponse(res);
  },

  async getById(id: string): Promise<{ trip: Trip }> {
    const res = await fetch(`${API_BASE}/api/trips/${id}`, {
      credentials: "include",
    });
    return handleResponse(res);
  },

  async list(userId?: string): Promise<{ trips: Trip[] }> {
    const url = userId ? `${API_BASE}/api/trips?userId=${userId}` : `${API_BASE}/api/trips`;
    const res = await fetch(url, { credentials: "include" });
    return handleResponse(res);
  },

  async updateStatus(id: string, status: string): Promise<{ trip: Trip }> {
    const res = await fetch(`${API_BASE}/api/trips/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      credentials: "include",
    });
    return handleResponse(res);
  },
};
