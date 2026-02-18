"use client";

import dynamic from "next/dynamic";
import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/ui/navbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StickyCTA } from "@/components/ui/sticky-cta";
import { MapSkeleton } from "@/components/map/MapSkeleton";
import { useRecentLocations } from "@/hooks/useRecentLocations";
import type { MapData, MapLocation } from "@/types";

const REBOOK_KEY = "vandi_rebook";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

const BookingForm = dynamic(() => import("@/components/booking/BookingForm"), {
  loading: () => <BookingFormSkeleton />,
});

const initialMapData: MapData = {
  pickupLat: null,
  pickupLng: null,
  dropLat: null,
  dropLng: null,
  pickupAddress: "",
  dropAddress: "",
  pickupAddressRaw: null,
  dropAddressRaw: null,
  pickupManuallyAdjusted: false,
  dropManuallyAdjusted: false,
  distance: null,
  durationMin: null,
  fare: null,
  mapZoom: 18,
  validationError: null,
};

function BookingFormSkeleton() {
  return (
    <div className="w-full space-y-6 rounded-2xl bg-zinc-900/80 p-8 animate-pulse">
      <div className="h-8 w-48 mx-auto bg-zinc-800 rounded" />
      <div className="h-4 w-full bg-zinc-800 rounded" />
      <div className="space-y-3">
        <div className="h-20 bg-zinc-800 rounded-xl" />
        <div className="h-20 bg-zinc-800 rounded-xl" />
        <div className="h-20 bg-zinc-800 rounded-xl" />
      </div>
      <div className="h-14 w-full bg-zinc-800 rounded-xl" />
    </div>
  );
}

export default function BookPage() {
  const [mapData, setMapData] = useState<MapData>(initialMapData);
  const [rebookData, setRebookData] = useState<{ pickup: MapLocation; drop: MapLocation } | null>(null);
  const { addLocation } = useRecentLocations();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(REBOOK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { pickup: MapLocation; drop: MapLocation };
        if (parsed?.pickup && parsed?.drop) {
          setRebookData(parsed);
          sessionStorage.removeItem(REBOOK_KEY);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAddRecent = useCallback((loc: MapLocation, _type: "pickup" | "drop") => {
    addLocation(loc, _type);
  }, [addLocation]);

  const handleMapDataChange = useCallback((data: MapData) => {
    setMapData(data);
  }, []);

  const canBook =
    mapData.pickupLat != null &&
    mapData.pickupLng != null &&
    mapData.dropLat != null &&
    mapData.dropLng != null &&
    !!mapData.pickupAddress &&
    !!mapData.dropAddress &&
    mapData.distance != null &&
    mapData.durationMin != null &&
    !mapData.validationError;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.86fr_1fr] lg:items-start lg:gap-8">
            {/* Map - left 65% on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="lg:sticky lg:top-24"
            >
              <ErrorBoundary>
                <MapView
                  onDataChange={handleMapDataChange}
                  onAddRecentLocation={handleAddRecent}
                  initialPickup={rebookData?.pickup}
                  initialDrop={rebookData?.drop}
                />
              </ErrorBoundary>
            </motion.div>

            {/* Booking card - right 35% on desktop */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="lg:sticky lg:top-24 lg:min-w-0"
            >
              <ErrorBoundary>
                <BookingForm mapData={mapData} onBookingSuccess={handleAddRecent} />
              </ErrorBoundary>
            </motion.div>
          </div>
        </div>

        {/* Sticky CTA on mobile */}
        {canBook && (
          <StickyCTA>
            <motion.a
              href="#book-ride-btn"
              whileTap={{ scale: 0.98 }}
              className="block w-full min-h-[52px] rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-center font-semibold text-white shadow-lg shadow-green-900/30 transition-shadow hover:shadow-green-800/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              aria-label="Book ride"
            >
              Book Ride
            </motion.a>
          </StickyCTA>
        )}
      </div>
    </AuthGuard>
  );
}
