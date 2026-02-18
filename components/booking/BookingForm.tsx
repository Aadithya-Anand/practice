"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import RideSelector from "@/components/booking/RideSelector";
import { FareBreakdown } from "@/components/booking/FareBreakdown";
import { toast } from "sonner";
import { Loader2, MessageSquare, Tag, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { tripsApi } from "@/lib/api";
import { calculateFare } from "@/lib/pricing";
import { validatePromoCode, applyPromoDiscount, type PromoResult } from "@/lib/promo";
import { useDefaultVehicle } from "@/hooks/useDefaultVehicle";
import type { MapData, VehicleType } from "@/types";

interface BookingFormProps {
  mapData: MapData;
  onBookingSuccess?: (loc: { lat: number; lng: number; formattedAddress: string; rawAddress: Record<string, string> | null }, type: "pickup" | "drop") => void;
}

export default function BookingForm({ mapData, onBookingSuccess }: BookingFormProps) {
  const router = useRouter();
  const { vehicle: defaultVehicle, setVehicle: setDefaultVehicle } = useDefaultVehicle();
  const [vehicleType, setVehicleType] = useState<VehicleType>(defaultVehicle);
  const [rideNotes, setRideNotes] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setVehicleType(defaultVehicle);
  }, [defaultVehicle]);

  const handleVehicleSelect = (v: VehicleType) => {
    setVehicleType(v);
    setDefaultVehicle(v);
  };

  const { pickupLat, pickupLng, dropLat, dropLng, pickupAddress, dropAddress, distance, durationMin } = mapData;

  const pricing = useMemo(() => {
    if (distance == null || distance <= 0) return null;
    return calculateFare({
      distanceKm: distance,
      vehicleType,
    });
  }, [distance, vehicleType]);

  const { finalFare, discount } = useMemo(() => {
    const base = pricing?.totalFare ?? 0;
    if (!promoResult?.valid) return { finalFare: base, discount: 0 };
    return applyPromoDiscount(base, promoResult);
  }, [pricing?.totalFare, promoResult]);

  const fare = finalFare;
  const canBook =
    pickupLat != null &&
    pickupLng != null &&
    dropLat != null &&
    dropLng != null &&
    pickupAddress &&
    dropAddress &&
    vehicleType &&
    fare != null &&
    distance != null &&
    durationMin != null &&
    !mapData.validationError;

  const handleApplyPromo = () => {
    const result = validatePromoCode(promoInput);
    setPromoResult(result);
    if (result.valid) toast.success(result.message);
    else if (promoInput.trim()) toast.error(result.message);
  };

  const handleBookRide = async () => {
    if (!canBook) return;
    setIsSubmitting(true);
    try {
      const { trip } = await tripsApi.create({
        pickupLat,
        pickupLng,
        dropLat,
        dropLng,
        pickupAddress,
        dropAddress,
        pickupAddressRaw: mapData.pickupAddressRaw ?? undefined,
        dropAddressRaw: mapData.dropAddressRaw ?? undefined,
        distanceKm: distance,
        durationMin,
        fare,
        vehicleType,
        rideNotes: rideNotes.trim() || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        promoCode: promoResult?.valid ? promoInput.trim().toUpperCase() : undefined,
      });
      toast.success("Ride booked!", { description: "Finding you a driver..." });
      onBookingSuccess?.(
        { lat: pickupLat, lng: pickupLng, formattedAddress: pickupAddress, rawAddress: mapData.pickupAddressRaw ?? null },
        "pickup"
      );
      onBookingSuccess?.(
        { lat: dropLat, lng: dropLng, formattedAddress: dropAddress, rawAddress: mapData.dropAddressRaw ?? null },
        "drop"
      );
      router.push(`/ride/${trip.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm sm:p-6">
      <div className="space-y-0.5">
        <h2 className="text-xl font-semibold text-white">Book a Ride</h2>
        <p className="text-sm text-zinc-500">
          Pick locations on the map, choose your vehicle.
        </p>
      </div>

      <RideSelector selected={vehicleType} onSelect={handleVehicleSelect} distanceKm={distance} />

      {/* Optional: Collapsible */}
      <div className="rounded-xl border border-zinc-700/50">
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm text-zinc-400 hover:text-zinc-300"
        >
          <span>Notes, schedule & promo</span>
          {showOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-zinc-700/50"
            >
              <div className="space-y-4 p-4 pt-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs text-zinc-500">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Ride notes
                  </label>
                  <input
                    type="text"
                    value={rideNotes}
                    onChange={(e) => setRideNotes(e.target.value)}
                    placeholder="Call when you arrive, gate code..."
                    maxLength={200}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Schedule for later
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs text-zinc-500">
                    <Tag className="h-3.5 w-3.5" />
                    Promo code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        setPromoResult(null);
                      }}
                      placeholder="WELCOME10"
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyPromo}
                      className="rounded-lg border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                    >
                      Apply
                    </Button>
                  </div>
                  {promoResult?.valid && (
                    <p className="mt-1.5 text-xs text-green-400">{promoResult.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {canBook && pricing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-zinc-700/80 bg-zinc-800/60 p-5">
              <h3 className="mb-3 font-semibold text-white">Ride Summary</h3>
              <p className="text-sm text-zinc-400">From: {pickupAddress}</p>
              <p className="mt-1 text-sm text-zinc-400">To: {dropAddress}</p>
              <p className="mt-1 text-sm text-zinc-400">Distance: {distance.toFixed(2)} km</p>
              {durationMin != null && (
                <p className="text-sm text-zinc-400">Duration: ~{Math.ceil(durationMin)} min</p>
              )}
              <div className="mt-4 border-t border-zinc-700 pt-4">
                {discount > 0 && (
                  <p className="mb-2 text-sm text-green-400">Promo discount: -₹{discount}</p>
                )}
                <FareBreakdown breakdown={pricing.breakdown} totalFare={fare} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileTap={canBook && !isSubmitting ? { scale: 0.98 } : undefined}>
        <Button
          id="book-ride-btn"
          className="min-h-[52px] w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 font-semibold text-white shadow-lg shadow-green-900/30 transition-all hover:shadow-green-800/40 hover:brightness-110 disabled:opacity-50"
          disabled={!canBook || isSubmitting}
          onClick={handleBookRide}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Booking...
            </span>
          ) : (
            "Book Ride"
          )}
        </Button>
      </motion.div>
    </div>
  );
}
