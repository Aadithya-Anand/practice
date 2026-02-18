/**
 * API Services Layer - Centralized fetch logic with retry
 */

import type { BookingRequest, Trip } from "@/types";

const API_BASE = "";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function handleResponse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    const msg = data?.error ?? `Request failed: ${res.status}`;
    if (res.status === 401) {
      throw new Error("Session expired. Please log in again.");
    }
    if (res.status >= 500) {
      throw new Error("Server error. Please try again later.");
    }
    throw new Error(msg);
  }
  return data as T;
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    const res = await fetch(url, options);
    return await handleResponse<T>(res);
  } catch (err) {
    if (retries > 0 && err instanceof Error && !err.message.includes("Session expired")) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      return fetchWithRetry<T>(url, options, retries - 1);
    }
    throw err;
  }
}

export type { Trip };

export const driverApi = {
  async getTrips(filter: "available" | "my"): Promise<{ trips: Trip[] }> {
    return fetchWithRetry(`${API_BASE}/api/driver/trips?filter=${filter}`, {
      credentials: "include",
    });
  },
  async acceptTrip(id: string): Promise<{ trip: Trip }> {
    return fetchWithRetry(`${API_BASE}/api/driver/trips/${id}/accept`, {
      method: "POST",
      credentials: "include",
    });
  },
  async setOnline(isOnline: boolean): Promise<{ isOnline: boolean }> {
    return fetchWithRetry(`${API_BASE}/api/driver/online`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOnline }),
      credentials: "include",
    });
  },
};

export const meApi = {
  async updateProfile(data: { name?: string }): Promise<{ user: { id: string; email: string; name?: string | null } }> {
    return fetchWithRetry(`${API_BASE}/api/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
  },
};

export const tripsApi = {
  async create(payload: BookingRequest): Promise<{ trip: Trip }> {
    return fetchWithRetry<{ trip: Trip }>(`${API_BASE}/api/trips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
  },

  async getById(id: string): Promise<{ trip: Trip }> {
    return fetchWithRetry<{ trip: Trip }>(`${API_BASE}/api/trips/${id}`, {
      credentials: "include",
      cache: "no-store",
    });
  },

  async list(): Promise<{ trips: Trip[] }> {
    return fetchWithRetry<{ trips: Trip[] }>(`${API_BASE}/api/trips`, {
      credentials: "include",
    });
  },

  async updateStatus(id: string, status: string): Promise<{ trip: Trip }> {
    return fetchWithRetry<{ trip: Trip }>(`${API_BASE}/api/trips/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
      credentials: "include",
    });
  },
};
