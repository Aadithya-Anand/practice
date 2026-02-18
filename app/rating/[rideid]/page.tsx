"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { tripsApi } from "@/lib/api";
import type { Trip } from "@/types";

export default function RatingPage({
  params,
}: {
  params: Promise<{ rideid: string }>;
}) {
  const router = useRouter();
  const [tripId, setTripId] = useState<string | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedStars, setSelectedStars] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    params.then((p) => setTripId(p.rideid));
  }, [params]);

  useEffect(() => {
    if (!tripId) return;
    tripsApi
      .getById(tripId)
      .then(({ trip: t }) => setTrip(t))
      .catch(() => setTrip(null));
  }, [tripId]);

  const handleSubmit = async () => {
    if (!tripId || selectedStars < 1) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: selectedStars }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed");
      toast.success("Thanks for rating your driver!");
      router.push("/history");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const driver = trip?.driver?.driverProfile;
  const alreadyRated = trip?.rating != null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="container mx-auto max-w-lg px-4 py-10">
          <Card className="border border-zinc-800 bg-zinc-900 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Rate Your Driver</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {driver && (
                <div className="flex items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-800/50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white">{driver.name}</p>
                    <p className="text-sm text-zinc-400">
                      {driver.vehicleType} · {driver.vehicleNumber}
                    </p>
                  </div>
                </div>
              )}
              {trip && (
                <p className="text-sm text-zinc-400">
                  {trip.pickupAddress} → {trip.dropAddress}
                </p>
              )}
              {alreadyRated ? (
                <p className="rounded-lg bg-green-500/20 py-3 text-center text-green-400">
                  You already rated this trip ★{trip?.rating?.stars}
                </p>
              ) : (
                <>
                  <p className="text-center text-sm text-zinc-400">
                    How was your ride with {driver?.name ?? "your driver"}?
                  </p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedStars(star)}
                        className="rounded-lg p-2 transition hover:scale-110"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= selectedStars
                              ? "fill-orange-500 text-orange-500"
                              : "text-zinc-500"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={handleSubmit}
                    disabled={selectedStars < 1 || submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Rating"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
