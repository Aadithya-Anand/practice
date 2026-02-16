"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import BookingForm from "@/components/booking/BookingForm";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/ui/navbar";
import type { MapData } from "@/components/map/MapView";

// Dynamic import avoids Leaflet SSR/hydration issues
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-xl bg-zinc-900 text-zinc-400">
      Loading map...
    </div>
  ),
});

export default function BookPage() {
  const [mapData, setMapData] = useState<MapData>({
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
  });

  const handleMapDataChange = useCallback((data: MapData) => {
    setMapData(data);
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="p-6 space-y-6">
          <MapView onDataChange={handleMapDataChange} />
          <BookingForm mapData={mapData} />
        </div>
      </div>
    </AuthGuard>
  );
}
