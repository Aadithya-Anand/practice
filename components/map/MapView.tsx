"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SearchInput from "./SearchInput";
import LocationHelper from "./LocationHelper";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";
import { validateBookingLocations } from "@/lib/validation";
import "leaflet/dist/leaflet.css";

// Zoom level for building-level precision (Uber-style)
const PRECISION_ZOOM = 19;

export interface StructuredAddress {
  formattedAddress: string;
  rawAddress: Record<string, string>;
}

export interface MapData {
  pickupLat: number | null;
  pickupLng: number | null;
  dropLat: number | null;
  dropLng: number | null;
  pickupAddress: string;
  dropAddress: string;
  pickupAddressRaw: StructuredAddress["rawAddress"] | null;
  dropAddressRaw: StructuredAddress["rawAddress"] | null;
  pickupManuallyAdjusted: boolean;
  dropManuallyAdjusted: boolean;
  distance: number | null;
  durationMin: number | null;
  fare: number | null;
  mapZoom: number;
  validationError: string | null;
}

interface MapViewProps {
  onDataChange: (data: MapData) => void;
}

const MapContent = dynamic(() => import("./MapContent"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-400">
      Loading map...
    </div>
  ),
});

export default function MapView({ onDataChange }: MapViewProps) {
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLng, setPickupLng] = useState<number | null>(null);
  const [dropLat, setDropLat] = useState<number | null>(null);
  const [dropLng, setDropLng] = useState<number | null>(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [pickupAddressRaw, setPickupAddressRaw] = useState<Record<string, string> | null>(null);
  const [dropAddressRaw, setDropAddressRaw] = useState<Record<string, string> | null>(null);
  const [pickupManuallyAdjusted, setPickupManuallyAdjusted] = useState(false);
  const [dropManuallyAdjusted, setDropManuallyAdjusted] = useState(false);
  const [geocodeFallbackMessage, setGeocodeFallbackMessage] = useState<string | null>(null);
  const [pickupNewlyPlaced, setPickupNewlyPlaced] = useState(false);
  const [dropNewlyPlaced, setDropNewlyPlaced] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [mapZoom, setMapZoom] = useState(18);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [adjustingLocation, setAdjustingLocation] = useState(false);

  const { fetchAddress: reverseGeocode, loading: geocodeLoading } = useReverseGeocode();

  const resetDrop = useCallback(() => {
    setDropLat(null);
    setDropLng(null);
    setDropAddress("");
    setDropAddressRaw(null);
    setDropManuallyAdjusted(false);
    setDropNewlyPlaced(false);
    setDistance(null);
    setDurationMin(null);
  }, []);

  const resetAll = useCallback(() => {
    setPickupLat(null);
    setPickupLng(null);
    setDropLat(null);
    setDropLng(null);
    setPickupAddress("");
    setDropAddress("");
    setPickupAddressRaw(null);
    setDropAddressRaw(null);
    setPickupManuallyAdjusted(false);
    setDropManuallyAdjusted(false);
    setPickupNewlyPlaced(false);
    setDropNewlyPlaced(false);
    setDistance(null);
    setDurationMin(null);
    setGeocodeFallbackMessage(null);
  }, []);

  const triggerNewlyPlaced = useCallback((type: "pickup" | "drop") => {
    if (type === "pickup") {
      setPickupNewlyPlaced(true);
      setTimeout(() => setPickupNewlyPlaced(false), 2500);
    } else {
      setDropNewlyPlaced(true);
      setTimeout(() => setDropNewlyPlaced(false), 2500);
    }
  }, []);

  // Reverse geocode on map click - building-level address. Keep coords on failure.
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      if (!pickupLat) {
        setAdjustingLocation(true);
        setGeocodeFallbackMessage(null);
        const res = await reverseGeocode(lat, lng);
        setAdjustingLocation(false);
        if (res) {
          const { result, isFallback } = res;
          setPickupLat(result.latitude);
          setPickupLng(result.longitude);
          setPickupAddress(result.formattedAddress);
          setPickupAddressRaw(result.rawAddress as Record<string, string>);
          setPickupManuallyAdjusted(false);
          if (isFallback) setGeocodeFallbackMessage("Address unavailable, but precise location saved.");
          triggerNewlyPlaced("pickup");
          resetDrop();
        }
      } else if (!dropLat) {
        setAdjustingLocation(true);
        setGeocodeFallbackMessage(null);
        const res = await reverseGeocode(lat, lng);
        setAdjustingLocation(false);
        if (res) {
          const { result, isFallback } = res;
          setDropLat(result.latitude);
          setDropLng(result.longitude);
          setDropAddress(result.formattedAddress);
          setDropAddressRaw(result.rawAddress as Record<string, string>);
          setDropManuallyAdjusted(false);
          if (isFallback) setGeocodeFallbackMessage("Address unavailable, but precise location saved.");
          triggerNewlyPlaced("drop");
        }
      } else {
        resetAll();
      }
    },
    [pickupLat, dropLat, reverseGeocode, resetDrop, resetAll, triggerNewlyPlaced]
  );

  // Re-geocode on marker drag end. Always keep coordinates; set manuallyAdjusted.
  const handleMarkerDragEnd = useCallback(
    async (type: "pickup" | "drop", lat: number, lng: number) => {
      setAdjustingLocation(true);
      setGeocodeFallbackMessage(null);
      const res = await reverseGeocode(lat, lng);
      setAdjustingLocation(false);

      if (type === "pickup") {
        setPickupLat(lat);
        setPickupLng(lng);
        setPickupManuallyAdjusted(true);
        if (res) {
          setPickupAddress(res.result.formattedAddress);
          setPickupAddressRaw(res.result.rawAddress as Record<string, string>);
          if (res.isFallback) setGeocodeFallbackMessage("Address unavailable, but precise location saved.");
        } else {
          setPickupAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setPickupAddressRaw(null);
          setGeocodeFallbackMessage("Address unavailable, but precise location saved.");
        }
        resetDrop();
      } else {
        setDropLat(lat);
        setDropLng(lng);
        setDropManuallyAdjusted(true);
        if (res) {
          setDropAddress(res.result.formattedAddress);
          setDropAddressRaw(res.result.rawAddress as Record<string, string>);
          if (res.isFallback) setGeocodeFallbackMessage("Address unavailable, but precise location saved.");
        } else {
          setDropAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setDropAddressRaw(null);
          setGeocodeFallbackMessage("Address unavailable, but precise location saved.");
        }
      }
    },
    [reverseGeocode, resetDrop]
  );

  const handleRouteFetched = useCallback((distKm: number, durMin: number) => {
    setDistance(distKm);
    setDurationMin(durMin);
  }, []);

  const handlePickupSearchSelect = useCallback(
    (result: { lat: number; lng: number; formattedAddress: string; rawAddress: Record<string, string> }) => {
      setPickupLat(result.lat);
      setPickupLng(result.lng);
      setPickupAddress(result.formattedAddress);
      setPickupAddressRaw(result.rawAddress);
      setPickupManuallyAdjusted(false);
      setMapZoom(PRECISION_ZOOM);
      triggerNewlyPlaced("pickup");
      resetDrop();
    },
    [resetDrop, triggerNewlyPlaced]
  );

  const handleDropSearchSelect = useCallback(
    (result: { lat: number; lng: number; formattedAddress: string; rawAddress: Record<string, string> }) => {
      setDropLat(result.lat);
      setDropLng(result.lng);
      setDropAddress(result.formattedAddress);
      setDropAddressRaw(result.rawAddress);
      setDropManuallyAdjusted(false);
      setMapZoom(PRECISION_ZOOM);
      triggerNewlyPlaced("drop");
    },
    [triggerNewlyPlaced]
  );

  // Validation
  const validationError = (() => {
    if (!pickupLat || !pickupLng || !dropLat || !dropLng || !pickupAddress || !dropAddress)
      return null;
    const v = validateBookingLocations(
      pickupLat,
      pickupLng,
      dropLat,
      dropLng,
      pickupAddress,
      dropAddress
    );
    return v.valid ? null : v.error ?? null;
  })();

  useEffect(() => {
    onDataChange({
      pickupLat,
      pickupLng,
      dropLat,
      dropLng,
      pickupAddress: pickupAddress || (pickupLat != null && pickupLng != null ? `${pickupLat.toFixed(6)}, ${pickupLng.toFixed(6)}` : ""),
      dropAddress: dropAddress || (dropLat != null && dropLng != null ? `${dropLat.toFixed(6)}, ${dropLng.toFixed(6)}` : ""),
      pickupAddressRaw,
      dropAddressRaw,
      pickupManuallyAdjusted,
      dropManuallyAdjusted,
      distance,
      durationMin,
      fare: null,
      mapZoom,
      validationError,
    });
  }, [pickupLat, pickupLng, dropLat, dropLng, pickupAddress, dropAddress, pickupAddressRaw, dropAddressRaw, pickupManuallyAdjusted, dropManuallyAdjusted, distance, durationMin, mapZoom, validationError, onDataChange]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const hasMarker = pickupLat != null || dropLat != null;
  const manuallyAdjusted = pickupManuallyAdjusted || dropManuallyAdjusted;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Search inputs: z-30 so dropdown sits above map. Uber-style: nearby suggestions, pin adjustment. */}
      <div className="relative z-30 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Pickup</label>
          <SearchInput
            value={pickupAddress}
            onChange={setPickupAddress}
            onSelect={handlePickupSearchSelect}
            placeholder="Search pickup location..."
            variant="pickup"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Drop</label>
          <SearchInput
            value={dropAddress}
            onChange={setDropAddress}
            onSelect={handleDropSearchSelect}
            placeholder="Search drop location..."
            disabled={!pickupLat}
            variant="drop"
          />
        </div>
      </div>
      <p className="text-xs text-zinc-500">
        Tip: Drag the map pin to your building entrance.
      </p>

      {/* Map: z-0 so it stays below search dropdown. LocationHelper = Uber-style badges + guidance. */}
      <div className="relative z-0">
        <LocationHelper
          mapZoom={mapZoom}
          hasMarker={!!hasMarker}
          manuallyAdjusted={manuallyAdjusted}
          isAdjusting={geocodeLoading || adjustingLocation}
        />
        {geocodeFallbackMessage && (
          <div className="absolute left-4 bottom-14 z-10 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
            {geocodeFallbackMessage}
          </div>
        )}
        <div className="relative h-[400px] w-full overflow-hidden rounded-xl bg-zinc-900">
          <MapContent
            pickupLat={pickupLat}
            pickupLng={pickupLng}
            dropLat={dropLat}
            dropLng={dropLng}
            pickupNewlyPlaced={pickupNewlyPlaced}
            dropNewlyPlaced={dropNewlyPlaced}
            userLocation={userLocation}
            onMapClick={handleMapClick}
            onMarkerDragEnd={handleMarkerDragEnd}
            onRouteFetched={handleRouteFetched}
            mapZoom={mapZoom}
          />
        </div>
        {hasMarker && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
            {manuallyAdjusted
              ? "Location saved. You can drag again to refine."
              : "Can't find your building? Drag the pin to exact entrance."}
          </p>
        )}
      </div>

      {validationError && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
          {validationError}
        </div>
      )}

    </div>
  );
}
