"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/ui/navbar";
import { useDriverSimulation } from "@/hooks/useDriverSimulation";
import { tripsApi } from "@/lib/api";
import { MapPin, Clock, Car, XCircle, Share2, MessageCircle, RefreshCw } from "lucide-react";

const TripMap = dynamic(() => import("@/components/map/TripMap"), { ssr: false });
import { toast } from "sonner";

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

export default function RidePage() {
  const router = useRouter();
  const params = useParams();
  const tripId = (params?.rideid as string) ?? null;
  const [cancelling, setCancelling] = useState(false);

  const { trip, status, loading, error, arrivingProgress, rideProgress, etaSeconds, mutate } =
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
  const canCancel = status === "SEARCHING" || status === "ACCEPTED";

  const handleShare = () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/ride/${tripId}`;
    navigator.clipboard?.writeText(url).then(() => {
      toast.success("Link copied!", { description: "Share this link to show trip status." });
    });
  };

  const handleShareWhatsApp = () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/ride/${tripId}`;
    const text = encodeURIComponent(`Track my ride: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCancel = async () => {
    if (!tripId || !canCancel) return;
    setCancelling(true);
    try {
      await tripsApi.updateStatus(tripId, "CANCELLED");
      router.push("/book");
    } catch {
      setCancelling(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-6">
          {/* Header: status + refresh */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                    STATUS_COLORS[status] ?? STATUS_COLORS.SEARCHING
                  }`}
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  {STATUS_LABELS[status] ?? status}
                </span>
              </motion.div>
            </AnimatePresence>
            <button
              onClick={() => mutate()}
              className="flex items-center gap-2 rounded-lg border border-zinc-600/80 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-zinc-500 hover:bg-zinc-800/80 hover:text-white"
              aria-label="Refresh status"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {/* Live map */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="mb-5 overflow-hidden rounded-xl border border-zinc-800"
          >
            <TripMap
              pickupLat={trip.pickupLat}
              pickupLng={trip.pickupLng}
              dropLat={trip.dropLat}
              dropLng={trip.dropLng}
              pickupAddress={trip.pickupAddress}
              dropAddress={trip.dropAddress}
              className="h-[200px]"
            />
          </motion.div>

          {/* Driver info - when driver assigned */}
          {trip.driver && trip.driver.driverProfile && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
            >
              <h3 className="mb-3 text-sm font-semibold text-zinc-300">Your driver</h3>
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-base font-bold text-white">
                  {trip.driver.driverProfile.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{trip.driver.driverProfile.name}</p>
                  <p className="text-sm text-zinc-400">
                    {trip.driver.driverProfile.vehicleType} · {trip.driver.driverProfile.vehicleNumber}
                  </p>
                  <p className="text-xs text-amber-400">
                    ★ {trip.driver.driverProfile.rating.toFixed(1)} rating
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Trip details card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
          >
            <h2 className="mb-3 text-sm font-semibold text-zinc-300">Trip details</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-zinc-500">Pickup</p>
                  <p className="truncate">{trip.pickupAddress || `${trip.pickupLat.toFixed(4)}, ${trip.pickupLng.toFixed(4)}`}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-zinc-500">Drop</p>
                  <p className="truncate">{trip.dropAddress || `${trip.dropLat.toFixed(4)}, ${trip.dropLng.toFixed(4)}`}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-zinc-700/80 pt-3">
                <span className="text-zinc-400">{trip.distanceKm.toFixed(2)} km · ~{Math.ceil(trip.durationMin)} min</span>
                <span className="font-semibold text-emerald-400">₹{trip.fare}</span>
              </div>
            </div>
          </motion.div>

          {/* Progress bars */}
          {status === "ARRIVING" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-zinc-400">Driver arriving</span>
                <span className="text-orange-400 font-medium">ETA: {etaSeconds}s</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
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
              className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-zinc-400">Ride progress</span>
                <span className="text-emerald-400 font-medium">{Math.round(rideProgress * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${rideProgress * 100}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>
          )}

          {/* Share buttons */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={handleShare}
              className="flex flex-1 min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/60 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              <Share2 className="h-4 w-4" />
              Copy link
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex flex-1 min-h-[44px] items-center justify-center gap-2 rounded-xl border border-emerald-600/50 bg-emerald-500/5 py-2.5 text-sm text-emerald-400 transition hover:bg-emerald-500/10"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
          </div>

          {/* Cancel - SEARCHING / ACCEPTED */}
          {canCancel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/5 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                {cancelling ? "Cancelling..." : "Cancel trip"}
              </button>
            </motion.div>
          )}

          {/* Completed - Rate driver */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 space-y-2"
            >
              <button
                onClick={() => router.push(`/rating/${tripId}`)}
                className="w-full min-h-[48px] rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
              >
                Rate your driver
              </button>
              <div className="flex gap-2">
                <a
                  href={`/receipt/${tripId}`}
                  className="flex flex-1 items-center justify-center min-h-[44px] rounded-xl border border-zinc-700 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800"
                >
                  View receipt
                </a>
                <button
                  onClick={() => router.push("/book")}
                  className="flex flex-1 items-center justify-center min-h-[44px] rounded-xl border border-zinc-700 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800"
                >
                  Book another
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
