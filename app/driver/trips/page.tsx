"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DriverGuard } from "@/components/DriverGuard";
import { DriverNavbar } from "@/components/DriverNavbar";
import { driverApi } from "@/lib/api";
import { MapPin, ChevronRight } from "lucide-react";
import type { Trip } from "@/types";

export default function DriverTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    driverApi
      .getTrips("my")
      .then(({ trips: t }) => setTrips(t))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DriverGuard>
      <div className="min-h-screen bg-zinc-950 text-white">
        <DriverNavbar />

        <div className="mx-auto max-w-2xl px-4 py-8">
          <h1 className="mb-6 text-2xl font-bold">My trips</h1>

          {loading ? (
            <p className="text-zinc-500">Loading...</p>
          ) : trips.length === 0 ? (
            <p className="rounded-xl border border-zinc-700 bg-zinc-800/50 py-12 text-center text-zinc-500">
              No trips yet. Accept a ride from the dashboard.
            </p>
          ) : (
            <ul className="space-y-3">
              {trips.map((trip) => (
                <li key={trip.id}>
                  <Link
                    href={`/driver/trip/${trip.id}`}
                    className="block rounded-xl border border-zinc-700 bg-zinc-800/80 p-4 transition hover:bg-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-green-500" />
                          <span className="truncate">
                            {trip.pickupAddress} → {trip.dropAddress}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          ₹{trip.fare} · {trip.status} · {new Date(trip.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-500" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DriverGuard>
  );
}
