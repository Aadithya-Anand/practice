"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import RideSelector from "@/components/booking/RideSelector";
import { toast } from "sonner";
import { tripsApi } from "@/lib/api";
import { calculateFare, type VehicleType } from "@/lib/pricing";
import type { MapData } from "@/components/map/MapView";

interface BookingFormProps {
  mapData: MapData;
}

export default function BookingForm({ mapData }: BookingFormProps) {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<VehicleType>("MINI");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { pickupLat, pickupLng, dropLat, dropLng, pickupAddress, dropAddress, distance, durationMin } = mapData;

  const pricing = useMemo(() => {
    if (distance == null || distance <= 0) return null;
    return calculateFare({
      distanceKm: distance,
      vehicleType,
    });
  }, [distance, vehicleType]);

  const fare = pricing?.totalFare ?? null;
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
      });
      toast.success("Ride booked!", { description: "Finding you a driver..." });
      router.push(`/ride/${trip.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6 p-6 bg-zinc-900 rounded-xl shadow-lg text-white">
      <h2 className="text-2xl font-bold text-center">Book a Ride</h2>

      <p className="text-sm text-zinc-400 text-center">
        Select pickup and drop on the map, then choose your vehicle.
      </p>

      <RideSelector selected={vehicleType} onSelect={setVehicleType} distanceKm={distance} />

      {canBook && pricing && (
        <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
          <h3 className="font-semibold mb-2">Ride Summary</h3>
          <p className="text-sm text-gray-400">From: {pickupAddress}</p>
          <p className="text-sm text-gray-400">To: {dropAddress}</p>
          <p className="text-sm text-gray-400 mt-1">Distance: {distance.toFixed(2)} km</p>
          {durationMin != null && (
            <p className="text-sm text-gray-400">Duration: ~{Math.ceil(durationMin)} min</p>
          )}
          {pricing.breakdown.timeMultiplierLabel && (
            <p className="text-xs text-amber-400 mt-1">{pricing.breakdown.timeMultiplierLabel}</p>
          )}
          <p className="mt-2 font-bold text-green-400">Total Fare: ₹{fare}</p>
        </div>
      )}

      <Button
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={!canBook || isSubmitting}
        onClick={handleBookRide}
      >
        {isSubmitting ? "Booking..." : "Book Ride"}
      </Button>
    </div>
  );
}
