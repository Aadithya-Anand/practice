"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { DriverGuard } from "@/components/DriverGuard";
import { DriverNavbar } from "@/components/DriverNavbar";
import { tripsApi } from "@/lib/api";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  IndianRupee,
  Car,
  Navigation,
  Play,
  CheckCircle2,
} from "lucide-react";
import type { Trip } from "@/types";

const TripMap = dynamic(() => import("@/components/map/TripMap"), { ssr: false });

const STATUS_NEXT: Record<string, { label: string; next: string }> = {
  ACCEPTED: { label: "I'm on my way", next: "ARRIVING" },
  ARRIVING: { label: "Start ride", next: "STARTED" },
  STARTED: { label: "Complete ride", next: "COMPLETED" },
};

export default function DriverTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [tripId, setTripId] = useState<string | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    params.then((p) => setTripId(p.id));
  }, [params]);

  useEffect(() => {
    if (!tripId) return;
    const fetch = async () => {
      try {
        const { trip: t } = await tripsApi.getById(tripId);
        setTrip(t);
      } catch {
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 3000);
    return () => clearInterval(interval);
  }, [tripId]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!tripId) return;
    setUpdating(true);
    try {
      await tripsApi.updateStatus(tripId, newStatus);
      const { trip: t } = await tripsApi.getById(tripId);
      setTrip(t);
      if (newStatus === "COMPLETED") {
        toast.success("Ride completed!");
        router.push("/driver");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DriverGuard>
        <div className="min-h-screen bg-zinc-950">
          <DriverNavbar />
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-zinc-400">Loading trip...</p>
          </div>
        </div>
      </DriverGuard>
    );
  }

  if (!trip) {
    return (
      <DriverGuard>
        <div className="min-h-screen bg-zinc-950">
          <DriverNavbar />
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
            <p className="text-amber-400">Trip not found</p>
            <button
              onClick={() => router.push("/driver")}
              className="rounded-xl bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </DriverGuard>
    );
  }

  const isCompleted = trip.status === "COMPLETED";
  const nextAction = STATUS_NEXT[trip.status];

  return (
    <DriverGuard>
      <div className="min-h-screen bg-zinc-950 text-white">
        <DriverNavbar />

        <div className="mx-auto max-w-lg px-4 py-8">
          <div className="mb-4 flex items-center gap-2">
            <span
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                trip.status === "ACCEPTED"
                  ? "bg-blue-500/20 text-blue-400"
                  : trip.status === "ARRIVING"
                    ? "bg-orange-500/20 text-orange-400"
                    : trip.status === "STARTED"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-zinc-500/20 text-zinc-400"
              }`}
            >
              {trip.status}
            </span>
          </div>

          <div className="mb-6">
            <TripMap
              pickupLat={trip.pickupLat}
              pickupLng={trip.pickupLng}
              dropLat={trip.dropLat}
              dropLng={trip.dropLng}
              pickupAddress={trip.pickupAddress}
              dropAddress={trip.dropAddress}
              className="h-[200px]"
            />
          </div>

          <div className="mb-6 rounded-xl border border-zinc-700 bg-zinc-800/80 p-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <div>
                  <p className="text-zinc-400">Pickup</p>
                  <p>{trip.pickupAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <div>
                  <p className="text-zinc-400">Drop</p>
                  <p>{trip.dropAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-zinc-500" />
                <span>{trip.distanceKm.toFixed(2)} km · ~{Math.ceil(trip.durationMin)} min</span>
              </div>
              <div className="flex items-center gap-3">
                <IndianRupee className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-green-400">₹{trip.fare}</span>
              </div>
              {trip.rideNotes && (
                <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-400">
                  Note: {trip.rideNotes}
                </div>
              )}
            </div>
          </div>

          {!isCompleted && nextAction && (
            <button
              onClick={() => handleUpdateStatus(nextAction.next)}
              disabled={updating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
            >
              {nextAction.next === "ARRIVING" ? (
                <Navigation className="h-5 w-5" />
              ) : nextAction.next === "STARTED" ? (
                <Play className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {updating ? "Updating..." : nextAction.label}
            </button>
          )}

          {isCompleted && (
            <button
              onClick={() => router.push("/driver")}
              className="w-full rounded-xl border border-zinc-600 py-4 text-zinc-300 transition hover:bg-zinc-800"
            >
              Back to dashboard
            </button>
          )}
        </div>
      </div>
    </DriverGuard>
  );
}
