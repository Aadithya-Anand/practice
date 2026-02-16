"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { tripsApi, type Trip } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/ui/navbar";

export default function HistoryPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tripsApi
      .list()
      .then(({ trips: t }) => setTrips(t))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-slate-100">
        <Navbar />
        <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10">
          <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-orange-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
            className="relative z-10 w-full max-w-3xl"
          >
            <Card className="border border-white/60 bg-white/80 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">Trip history</CardTitle>
                  <CardDescription className="text-slate-500">
                    Quickly revisit and inspect your recent trips.
                  </CardDescription>
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 md:inline-flex">
                  <Clock className="h-3.5 w-3.5" />
                  Recent trips
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="py-4 text-sm text-slate-500">Loading trips...</p>
                ) : trips.length === 0 ? (
                  <p className="py-4 text-sm text-slate-500">No trips yet. Book your first ride!</p>
                ) : (
                  <ul className="divide-y divide-slate-200 text-sm">
                    {trips.map((trip, index) => (
                      <motion.li
                        key={trip.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05, duration: 0.25 }}
                        className="flex items-center justify-between gap-4 py-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                              #{trip.id.slice(-6)}
                            </span>
                            <span className="text-xs text-slate-500">
                              {trip.status} · {formatTime(trip.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-800">
                            <MapPin className="h-3.5 w-3.5 text-orange-500" />
                            <span>
                              {trip.pickupAddress ?? "Pickup"}{" "}
                              <span className="mx-1">→</span>{" "}
                              {trip.dropAddress ?? "Drop"}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/ride/${trip.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600"
                        >
                          View details
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
