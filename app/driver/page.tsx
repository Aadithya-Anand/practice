"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DriverGuard } from "@/components/DriverGuard";
import { DriverNavbar } from "@/components/DriverNavbar";
import { driverApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MapPin,
  IndianRupee,
  Car,
  Clock,
  CheckCircle2,
  Radio,
  Loader2,
} from "lucide-react";
import type { Trip } from "@/types";

export default function DriverDashboardPage() {
  const { user, refetch } = useAuth();
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [myActiveTrip, setMyActiveTrip] = useState<Trip | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  // Load isOnline from profile on mount
  useEffect(() => {
    if (user?.driverProfile?.isOnline != null) {
      setIsOnline(user.driverProfile.isOnline);
    }
  }, [user?.driverProfile?.isOnline]);

  const fetchTrips = useCallback(async () => {
    try {
      const [available, my] = await Promise.all([
        driverApi.getTrips("available"),
        driverApi.getTrips("my"),
      ]);
      setAvailableTrips(available.trips);
      const active = my.trips.find(
        (t) => !["COMPLETED", "CANCELLED"].includes(t.status)
      );
      setMyActiveTrip(active ?? null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
    const interval = setInterval(fetchTrips, 5000);
    return () => clearInterval(interval);
  }, [fetchTrips, isOnline]);

  const handleToggleOnline = async () => {
    try {
      await driverApi.setOnline(!isOnline);
      setIsOnline(!isOnline);
      toast.success(isOnline ? "You're now offline" : "You're now online");
      await refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleAccept = async (tripId: string) => {
    setAccepting(tripId);
    try {
      const { trip } = await driverApi.acceptTrip(tripId);
      setMyActiveTrip(trip);
      setAvailableTrips((prev) => prev.filter((t) => t.id !== tripId));
      toast.success("Trip accepted! Navigate to the pickup.");
      window.location.href = `/driver/trip/${tripId}`;
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAccepting(null);
    }
  };

  return (
    <DriverGuard>
      <div className="min-h-screen bg-zinc-950 text-white">
        <DriverNavbar />

        <div className="mx-auto max-w-2xl px-4 py-8">
          {/* Online toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={handleToggleOnline}
              className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 font-semibold transition-all ${
                isOnline
                  ? "bg-green-600/20 text-green-400 ring-2 ring-green-500/50"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              <Radio className="h-5 w-5" />
              {isOnline ? "You're online — accepting rides" : "Go online to receive rides"}
            </button>
          </motion.div>

          {/* Active trip */}
          {myActiveTrip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="mb-3 text-lg font-semibold text-zinc-300">Active trip</h2>
              <a
                href={`/driver/trip/${myActiveTrip.id}`}
                className="block rounded-xl border border-orange-500/40 bg-orange-500/10 p-4 transition hover:bg-orange-500/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {myActiveTrip.pickupAddress} → {myActiveTrip.dropAddress}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      ₹{myActiveTrip.fare} · {myActiveTrip.vehicleType}
                    </p>
                  </div>
                  <span className="rounded-full bg-orange-500/30 px-3 py-1 text-sm font-medium text-orange-400">
                    {myActiveTrip.status}
                  </span>
                </div>
              </a>
            </motion.div>
          )}

          {/* Available trips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="mb-3 text-lg font-semibold text-zinc-300">
              Available rides {isOnline && `(${availableTrips.length})`}
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
              </div>
            ) : !isOnline ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 py-8 text-center">
                <p className="text-amber-400 font-medium">You're offline</p>
                <p className="mt-1 text-sm text-zinc-400">Tap "Go online" above to receive ride requests</p>
              </div>
            ) : availableTrips.length === 0 ? (
              <p className="rounded-xl border border-zinc-700 bg-zinc-800/50 py-8 text-center text-zinc-500">
                No rides available. New rides will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {availableTrips.map((trip) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border border-zinc-700 bg-zinc-800/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <MapPin className="h-4 w-4 shrink-0 text-green-500" />
                          <span className="truncate text-sm">{trip.pickupAddress}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-zinc-400">
                          <MapPin className="h-4 w-4 shrink-0 text-red-500" />
                          <span className="truncate text-sm">{trip.dropAddress}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500">
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-3.5 w-3.5" />
                            ₹{trip.fare}
                          </span>
                          <span className="flex items-center gap-1">
                            <Car className="h-3.5 w-3.5" />
                            {trip.vehicleType}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            ~{Math.ceil(trip.durationMin)} min
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAccept(trip.id)}
                        disabled={!!accepting}
                        className="flex shrink-0 items-center gap-2 rounded-xl bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
                      >
                        {accepting === trip.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Accept
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DriverGuard>
  );
}
