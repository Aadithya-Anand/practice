"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import SearchInput from "./SearchInput";
import LocationHelper from "./LocationHelper";
import { RecentLocationsChips } from "./RecentLocationsChips";
import { SavedPlacesChips } from "./SavedPlacesChips";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";
import { useRecentLocations } from "@/hooks/useRecentLocations";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { LocationSearchProvider } from "@/contexts/LocationSearchContext";
import { validateBookingLocations } from "@/lib/validation";
import { MapPin, ArrowDownUp } from "lucide-react";
import type { MapLocation } from "@/types";
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
  onAddRecentLocation?: (loc: MapLocation, type: "pickup" | "drop") => void;
  initialPickup?: MapLocation | null;
  initialDrop?: MapLocation | null;
}

const MapContent = dynamic(() => import("./MapContent"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-400">
      Loading map...
    </div>
  ),
});

export default function MapView({ onDataChange, onAddRecentLocation, initialPickup, initialDrop }: MapViewProps) {
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
  const { locations: recentLocations } = useRecentLocations();
  const { places: savedPlaces, addPlace } = useSavedPlaces();

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

  const handleSavedPlaceSelect = useCallback(
    (place: { lat: number; lng: number; formattedAddress: string; rawAddress: Record<string, string> | null }, type: "pickup" | "drop") => {
      const raw = (place.rawAddress ?? {}) as Record<string, string>;
      if (type === "pickup") {
        setPickupLat(place.lat);
        setPickupLng(place.lng);
        setPickupAddress(place.formattedAddress);
        setPickupAddressRaw(Object.keys(raw).length ? raw : null);
        setPickupManuallyAdjusted(false);
        setMapZoom(PRECISION_ZOOM);
        triggerNewlyPlaced("pickup");
        resetDrop();
      } else {
        setDropLat(place.lat);
        setDropLng(place.lng);
        setDropAddress(place.formattedAddress);
        setDropAddressRaw(Object.keys(raw).length ? raw : null);
        setDropManuallyAdjusted(false);
        setMapZoom(PRECISION_ZOOM);
        triggerNewlyPlaced("drop");
      }
    },
    [resetDrop, triggerNewlyPlaced]
  );

  const handleRecentChipSelect = useCallback(
    (loc: MapLocation, type: "pickup" | "drop") => {
      const raw = (loc.rawAddress ?? {}) as Record<string, string>;
      if (type === "pickup") {
        setPickupLat(loc.lat);
        setPickupLng(loc.lng);
        setPickupAddress(loc.formattedAddress);
        setPickupAddressRaw(Object.keys(raw).length ? raw : null);
        setPickupManuallyAdjusted(false);
        setMapZoom(PRECISION_ZOOM);
        triggerNewlyPlaced("pickup");
        resetDrop();
      } else {
        setDropLat(loc.lat);
        setDropLng(loc.lng);
        setDropAddress(loc.formattedAddress);
        setDropAddressRaw(Object.keys(raw).length ? raw : null);
        setDropManuallyAdjusted(false);
        setMapZoom(PRECISION_ZOOM);
        triggerNewlyPlaced("drop");
      }
    },
    [resetDrop, triggerNewlyPlaced]
  );

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
          onAddRecentLocation?.(
            {
              lat: result.latitude,
              lng: result.longitude,
              formattedAddress: result.formattedAddress,
              rawAddress: result.rawAddress as Record<string, string>,
            },
            "pickup"
          );
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
          onAddRecentLocation?.(
            {
              lat: result.latitude,
              lng: result.longitude,
              formattedAddress: result.formattedAddress,
              rawAddress: result.rawAddress as Record<string, string>,
            },
            "drop"
          );
        }
      } else {
        resetAll();
      }
    },
    [pickupLat, dropLat, reverseGeocode, resetDrop, resetAll, triggerNewlyPlaced, onAddRecentLocation]
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

  const handlePickupSelect = useCallback(
    (result: { lat: number; lng: number; formattedAddress: string; rawAddress: Record<string, string> }) => {
      setPickupLat(result.lat);
      setPickupLng(result.lng);
      setPickupAddress(result.formattedAddress);
      setPickupAddressRaw(result.rawAddress);
      setPickupManuallyAdjusted(false);
      setMapZoom(PRECISION_ZOOM);
      triggerNewlyPlaced("pickup");
      resetDrop();
      onAddRecentLocation?.(
        { lat: result.lat, lng: result.lng, formattedAddress: result.formattedAddress, rawAddress: result.rawAddress },
        "pickup"
      );
    },
    [resetDrop, triggerNewlyPlaced, onAddRecentLocation]
  );

  const handleDropSelect = useCallback(
    (result: { lat: number; lng: number; formattedAddress: string; rawAddress: Record<string, string> }) => {
      setDropLat(result.lat);
      setDropLng(result.lng);
      setDropAddress(result.formattedAddress);
      setDropAddressRaw(result.rawAddress);
      setDropManuallyAdjusted(false);
      setMapZoom(PRECISION_ZOOM);
      triggerNewlyPlaced("drop");
      onAddRecentLocation?.(
        { lat: result.lat, lng: result.lng, formattedAddress: result.formattedAddress, rawAddress: result.rawAddress },
        "drop"
      );
    },
    [triggerNewlyPlaced, onAddRecentLocation]
  );

  const handleSwapPickupDrop = useCallback(() => {
    if (!pickupLat || !pickupLng || !dropLat || !dropLng) return;
    setPickupLat(dropLat);
    setPickupLng(dropLng);
    setPickupAddress(dropAddress);
    setPickupAddressRaw(dropAddressRaw);
    setPickupManuallyAdjusted(dropManuallyAdjusted);
    setDropLat(pickupLat);
    setDropLng(pickupLng);
    setDropAddress(pickupAddress);
    setDropAddressRaw(pickupAddressRaw);
    setDropManuallyAdjusted(pickupManuallyAdjusted);
  }, [pickupLat, pickupLng, dropLat, dropLng, pickupAddress, dropAddress, pickupAddressRaw, dropAddressRaw, pickupManuallyAdjusted, dropManuallyAdjusted]);

  const handleUseCurrentLocation = useCallback(async (forDrop: boolean) => {
    if (!userLocation) return;
    setAdjustingLocation(true);
    setGeocodeFallbackMessage(null);
    const res = await reverseGeocode(userLocation.lat, userLocation.lng);
    setAdjustingLocation(false);
    if (res) {
      const { result, isFallback } = res;
      const loc = {
        lat: result.latitude,
        lng: result.longitude,
        formattedAddress: result.formattedAddress,
        rawAddress: result.rawAddress as Record<string, string>,
      };
      if (forDrop) {
        setDropLat(loc.lat);
        setDropLng(loc.lng);
        setDropAddress(loc.formattedAddress);
        setDropAddressRaw(loc.rawAddress);
        setDropManuallyAdjusted(false);
        triggerNewlyPlaced("drop");
        onAddRecentLocation?.({ ...loc, rawAddress: loc.rawAddress }, "drop");
      } else {
        setPickupLat(loc.lat);
        setPickupLng(loc.lng);
        setPickupAddress(loc.formattedAddress);
        setPickupAddressRaw(loc.rawAddress);
        setPickupManuallyAdjusted(false);
        triggerNewlyPlaced("pickup");
        resetDrop();
        onAddRecentLocation?.({ ...loc, rawAddress: loc.rawAddress }, "pickup");
      }
      if (isFallback) setGeocodeFallbackMessage("Address unavailable, but precise location saved.");
    }
  }, [userLocation, reverseGeocode, resetDrop, triggerNewlyPlaced, onAddRecentLocation]);

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
    if (initialPickup) {
      setPickupLat(initialPickup.lat);
      setPickupLng(initialPickup.lng);
      setPickupAddress(initialPickup.formattedAddress);
      setPickupAddressRaw(initialPickup.rawAddress);
    }
    if (initialDrop) {
      setDropLat(initialDrop.lat);
      setDropLng(initialDrop.lng);
      setDropAddress(initialDrop.formattedAddress);
      setDropAddressRaw(initialDrop.rawAddress);
    }
  }, [initialPickup, initialDrop]);

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
    <LocationSearchProvider>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex w-full flex-col gap-6"
    >
      {/* Search inputs: z-30 so dropdown sits above map. */}
      <div className="relative z-30 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 flex justify-center -mt-1">
          {pickupLat != null && dropLat != null && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSwapPickupDrop}
              className="flex items-center gap-2 rounded-full border border-zinc-600 bg-zinc-800/80 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-700"
              aria-label="Swap pickup and drop"
            >
              <ArrowDownUp className="h-4 w-4" />
              Swap pickup & drop
            </motion.button>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <label className="mb-2 block text-sm font-medium text-zinc-400">Pickup</label>
          <div className="space-y-2">
            {savedPlaces.length > 0 && (
              <SavedPlacesChips
                places={savedPlaces}
                onSelect={(p) => handleSavedPlaceSelect(p, "pickup")}
                variant="pickup"
              />
            )}
            {recentLocations.length > 0 && !pickupLat && (
              <RecentLocationsChips
                locations={recentLocations}
                onSelect={(loc) => handleRecentChipSelect(loc, "pickup")}
                variant="pickup"
              />
            )}
            <SearchInput
              value={pickupAddress}
              onChange={setPickupAddress}
              onSelect={handlePickupSelect}
              placeholder="Search pickup location..."
              variant="pickup"
            />
            {pickupLat != null && pickupAddress && (
              <div className="flex gap-2">
                {!savedPlaces.some((p) => p.label === "home") && (
                  <button
                    type="button"
                    onClick={() =>
                      addPlace(
                        {
                          lat: pickupLat,
                          lng: pickupLng!,
                          formattedAddress: pickupAddress,
                          rawAddress: pickupAddressRaw,
                        },
                        "home"
                      )
                    }
                    className="text-xs text-zinc-500 underline hover:text-orange-400"
                  >
                    Save as Home
                  </button>
                )}
                {!savedPlaces.some((p) => p.label === "work") && (
                  <button
                    type="button"
                    onClick={() =>
                      addPlace(
                        {
                          lat: pickupLat,
                          lng: pickupLng!,
                          formattedAddress: pickupAddress,
                          rawAddress: pickupAddressRaw,
                        },
                        "work"
                      )
                    }
                    className="text-xs text-zinc-500 underline hover:text-orange-400"
                  >
                    Save as Work
                  </button>
                )}
              </div>
            )}
            {userLocation && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUseCurrentLocation(false)}
                disabled={geocodeLoading || adjustingLocation}
                className="flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-700 disabled:opacity-50"
                aria-label="Use current location as pickup"
              >
                <MapPin className="h-4 w-4 text-green-500" />
                Use current location
              </motion.button>
            )}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <label className="mb-2 block text-sm font-medium text-zinc-400">Drop</label>
          <div className="space-y-2">
            {savedPlaces.length > 0 && pickupLat && (
              <SavedPlacesChips
                places={savedPlaces}
                onSelect={(p) => handleSavedPlaceSelect(p, "drop")}
                variant="drop"
              />
            )}
            {recentLocations.length > 0 && pickupLat && !dropLat && (
              <RecentLocationsChips
                locations={recentLocations}
                onSelect={(loc) => handleRecentChipSelect(loc, "drop")}
                variant="drop"
              />
            )}
            <SearchInput
              value={dropAddress}
              onChange={setDropAddress}
              onSelect={handleDropSelect}
              placeholder="Search drop location..."
              disabled={!pickupLat}
              variant="drop"
            />
            {dropLat != null && dropAddress && (
              <div className="flex gap-2">
                {!savedPlaces.some((p) => p.label === "home") && (
                  <button
                    type="button"
                    onClick={() =>
                      addPlace(
                        {
                          lat: dropLat,
                          lng: dropLng!,
                          formattedAddress: dropAddress,
                          rawAddress: dropAddressRaw,
                        },
                        "home"
                      )
                    }
                    className="text-xs text-zinc-500 underline hover:text-orange-400"
                  >
                    Save as Home
                  </button>
                )}
                {!savedPlaces.some((p) => p.label === "work") && (
                  <button
                    type="button"
                    onClick={() =>
                      addPlace(
                        {
                          lat: dropLat,
                          lng: dropLng!,
                          formattedAddress: dropAddress,
                          rawAddress: dropAddressRaw,
                        },
                        "work"
                      )
                    }
                    className="text-xs text-zinc-500 underline hover:text-orange-400"
                  >
                    Save as Work
                  </button>
                )}
              </div>
            )}
            {userLocation && pickupLat && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUseCurrentLocation(true)}
                disabled={geocodeLoading || adjustingLocation}
                className="flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-xl border border-zinc-600 bg-zinc-800/80 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-700 disabled:opacity-50"
                aria-label="Use current location as drop"
              >
                <MapPin className="h-4 w-4 text-blue-500" />
                Use current location
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="text-xs text-zinc-500"
      >
        Tip: Drag the map pin to your building entrance.
      </motion.p>

      {/* Map card with glass effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-0 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 shadow-xl backdrop-blur-sm"
      >
        <LocationHelper
          mapZoom={mapZoom}
          hasMarker={!!hasMarker}
          manuallyAdjusted={manuallyAdjusted}
          isAdjusting={geocodeLoading || adjustingLocation}
        />
        {geocodeFallbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-4 bottom-14 z-10 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-400"
          >
            {geocodeFallbackMessage}
          </motion.div>
        )}
        <div className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-zinc-900/80 md:h-[50vh] lg:h-[70vh]">
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500"
          >
            {manuallyAdjusted
              ? "Location saved. You can drag again to refine."
              : "Can't find your building? Drag the pin to exact entrance."}
          </motion.p>
        )}
      </motion.div>

      {validationError && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-400"
        >
          {validationError}
        </motion.div>
      )}

    </motion.div>
    </LocationSearchProvider>
  );
}
