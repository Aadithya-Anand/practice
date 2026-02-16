"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/ui/navbar";
import { useDriverSimulation } from "@/hooks/useDriverSimulation";
import { MapPin, Clock, IndianRupee, Car } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  SEARCHING: "Finding driver...",
  ACCEPTED: "Driver accepted",
  ARRIVING: "Driver on the way",
  STARTED: "Ride in progress",
  COMPLETED: "Trip completed",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  SEARCHING: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  ACCEPTED: "bg-blue-500/20 text-blue-400 border-blue-500/40",
  ARRIVING: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  STARTED: "bg-green-500/20 text-green-400 border-green-500/40",
  COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  CANCELLED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/40",
};

export default function RidePage({
  params,
}: {
  params: Promise<{ rideid: string }>;
}) {
  const router = useRouter();
  const [tripId, setTripId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setTripId(p.rideid));
  }, [params]);

  const { trip, status, loading, error, arrivingProgress, rideProgress, etaSeconds } =
    useDriverSimulation(tripId);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-zinc-950">
          <Navbar />
          <div className="flex min-h-[60vh] items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              <p className="text-zinc-400">Loading trip...</p>
            </motion.div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !trip) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-zinc-950">
          <Navbar />
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
            <p className="text-amber-400">{error ?? "Trip not found"}</p>
            <button
              onClick={() => router.push("/book")}
              className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              Book a ride
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const isCompleted = status === "COMPLETED";

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-8">
          {/* Status badge - animated */}
          <AnimatePresence mode="wait">
            <motion.div
              key={status}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
                  STATUS_COLORS[status] ?? STATUS_COLORS.SEARCHING
                }`}
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
                {STATUS_LABELS[status] ?? status}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Trip details card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <h2 className="mb-4 text-xl font-semibold">Trip Details</h2>

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
          </motion.div>

          {/* Progress bars */}
          {status === "ARRIVING" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6"
            >
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-zinc-400">Driver arriving</span>
                <span className="text-orange-400">ETA: {etaSeconds}s</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  className="h-full bg-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${arrivingProgress * 100}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>
          )}

          {status === "STARTED" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6"
            >
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-zinc-400">Ride progress</span>
                <span className="text-green-400">{Math.round(rideProgress * 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  className="h-full bg-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${rideProgress * 100}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>
          )}

          {/* Completed - Rate button */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <button
                onClick={() => router.push(`/rating/${tripId}`)}
                className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                Rate your trip
              </button>
              <button
                onClick={() => router.push("/book")}
                className="mt-3 w-full rounded-xl border border-zinc-700 py-3 text-zinc-300 transition hover:bg-zinc-800"
              >
                Book another ride
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
