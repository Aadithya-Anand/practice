"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Car, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useTrips } from "@/hooks/useTrips";
import type { Trip, TripStatus } from "@/types";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/ui/navbar";

const REBOOK_KEY = "vandi_rebook";

function storeRebook(trip: { pickupLat: number; pickupLng: number; dropLat: number; dropLng: number; pickupAddress: string; dropAddress: string; pickupAddressRaw?: unknown; dropAddressRaw?: unknown }) {
  try {
    sessionStorage.setItem(REBOOK_KEY, JSON.stringify({
      pickup: { lat: trip.pickupLat, lng: trip.pickupLng, formattedAddress: trip.pickupAddress, rawAddress: trip.pickupAddressRaw ?? null },
      drop: { lat: trip.dropLat, lng: trip.dropLng, formattedAddress: trip.dropAddress, rawAddress: trip.dropAddressRaw ?? null },
    }));
  } catch {
    // ignore
  }
}

const STATUS_OPTIONS: { value: TripStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "SEARCHING", label: "Searching" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "ARRIVING", label: "Arriving" },
  { value: "STARTED", label: "In progress" },
];

export default function HistoryPage() {
  const router = useRouter();
  const { trips, loading } = useTrips();
  const [statusFilter, setStatusFilter] = useState<TripStatus | "ALL">("ALL");

  const filteredTrips = useMemo(() => {
    if (statusFilter === "ALL") return trips;
    return trips.filter((t) => t.status === statusFilter);
  }, [trips, statusFilter]);

  const getStatusColor = (s: string) => {
    const m: Record<string, string> = {
      COMPLETED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-slate-100 text-slate-600",
      SEARCHING: "bg-amber-100 text-amber-700",
      ACCEPTED: "bg-blue-100 text-blue-700",
      ARRIVING: "bg-orange-100 text-orange-700",
      STARTED: "bg-green-100 text-green-700",
    };
    return m[s] ?? "bg-slate-100 text-slate-600";
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      );
    }
    if (trips.length === 0) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-12">
          <EmptyState
            variant="light"
            icon={<Car className="h-8 w-8" />}
            title="No trips yet"
            description="Book your first ride to see your trip history here."
            action={
              <Link
                href="/book"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Book your first ride
              </Link>
            }
          />
        </div>
      );
    }
    if (filteredTrips.length === 0) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500">
          No trips match this filter.
        </div>
      );
    }
    return (
      <ul className="space-y-3">
        {filteredTrips.map((trip, index) => (
          <motion.li
            key={trip.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
          >
            <Link
              href={`/ride/${trip.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                    <span className="text-xs text-slate-500">{formatTime(trip.createdAt)}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-800">
                    {trip.pickupAddress ?? "Pickup"}
                    <span className="mx-1 text-slate-400">→</span>
                    {trip.dropAddress ?? "Drop"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">₹{trip.fare}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        storeRebook(trip);
                        router.push("/book");
                      }}
                      className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      Rebook
                    </button>
                    {trip.status === "COMPLETED" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/receipt/${trip.id}`);
                        }}
                        className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    );
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Trip history</h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  Your recent rides
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <Filter className="h-4 w-4 shrink-0 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TripStatus | "ALL")}
                  className="min-w-[120px] border-none bg-transparent text-sm font-medium text-slate-700 focus:outline-none focus:ring-0"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {renderContent()}
            </div>
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
