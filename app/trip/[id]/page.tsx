"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Clock, IndianRupee, Car } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  SEARCHING: "Finding driver...",
  ACCEPTED: "Driver accepted",
  ARRIVING: "Driver on the way",
  STARTED: "Ride in progress",
  COMPLETED: "Trip completed",
  CANCELLED: "Cancelled",
};

export default function ShareTripPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [trip, setTrip] = useState<{
    id: string;
    pickupAddress: string;
    dropAddress: string;
    pickupLat: number;
    pickupLng: number;
    dropLat: number;
    dropLng: number;
    distanceKm: number;
    durationMin: number;
    fare: number;
    vehicleType: string;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/trips/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Trip not found");
        return res.json();
      })
      .then((data) => {
        setTrip(data.trip);
      })
      .catch(() => setError("Trip not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 text-white">
        <p className="text-amber-400">{error ?? "Trip not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-xl font-semibold">Shared Trip</h1>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <span className="mb-4 inline-block rounded-full border border-zinc-600 px-3 py-1 text-sm text-zinc-400">
            {STATUS_LABELS[trip.status] ?? trip.status}
          </span>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <div>
                <p className="text-zinc-400">Pickup</p>
                <p>{trip.pickupAddress || `${trip.pickupLat.toFixed(4)}, ${trip.pickupLng.toFixed(4)}`}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <div>
                <p className="text-zinc-400">Drop</p>
                <p>{trip.dropAddress || `${trip.dropLat.toFixed(4)}, ${trip.dropLng.toFixed(4)}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span>{trip.distanceKm.toFixed(2)} km · ~{Math.ceil(trip.durationMin)} min</span>
            </div>
            <div className="flex items-center gap-3">
              <Car className="h-4 w-4 text-zinc-500" />
              <span>{trip.vehicleType}</span>
            </div>
            <div className="flex items-center gap-3">
              <IndianRupee className="h-4 w-4 text-green-500" />
              <span className="font-semibold text-green-400">₹{trip.fare}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
