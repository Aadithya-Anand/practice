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

export default function RatingPage({
  params,
}: {
  params: Promise<{ rideid: string }>;
}) {
  const router = useRouter();
  const [tripId, setTripId] = useState<string | null>(null);
  const [trip, setTrip] = useState<{ pickupAddress: string; dropAddress: string } | null>(null);
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
      await fetch(`/api/trips/${tripId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: selectedStars }),
        credentials: "include",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      });
      toast.success("Thanks for rating!");
      router.push("/history");
    } catch {
      toast.error("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="container mx-auto max-w-lg px-4 py-10">
          <Card className="border border-zinc-800 bg-zinc-900 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Rate Your Trip</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {trip && (
                <p className="text-sm text-zinc-400">
                  {trip.pickupAddress} → {trip.dropAddress}
                </p>
              )}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
