"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tripsApi } from "@/lib/api";
import type { Trip } from "@/types";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/ui/navbar";

export default function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [tripId, setTripId] = useState<string | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setTripId(p.id));
  }, [params]);

  useEffect(() => {
    if (!tripId) return;
    tripsApi
      .getById(tripId)
      .then(({ trip: t }) => setTrip(t))
      .catch(() => setTrip(null))
      .finally(() => setLoading(false));
  }, [tripId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-white">
          <Navbar />
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-slate-500">Loading receipt...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!trip) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-white">
          <Navbar />
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
            <p className="text-amber-600">Trip not found</p>
            <Link href="/history" className="text-orange-500 hover:underline">
              Back to history
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const date = new Date(trip.createdAt).toLocaleString();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-lg px-4 py-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm print:shadow-none">
            <div className="mb-6 border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-bold text-slate-900">Trip Receipt</h1>
              <p className="mt-1 text-sm text-slate-500">#{trip.id.slice(-8).toUpperCase()}</p>
              <p className="text-sm text-slate-500">{date}</p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Pickup</p>
                <p className="font-medium text-slate-900">{trip.pickupAddress}</p>
              </div>
              <div>
                <p className="text-slate-500">Drop</p>
                <p className="font-medium text-slate-900">{trip.dropAddress}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Distance</span>
                <span className="font-medium">{trip.distanceKm.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium">~{Math.ceil(trip.durationMin)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle</span>
                <span className="font-medium">{trip.vehicleType}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-4">
                <span className="font-semibold text-slate-900">Total fare</span>
                <span className="text-xl font-bold text-slate-900">₹{trip.fare}</span>
              </div>
            </div>

            <div className="mt-8 flex gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 rounded-xl bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600"
              >
                Print receipt
              </button>
              <Link
                href="/history"
                className="flex-1 rounded-xl border border-slate-300 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to history
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
