"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import DraggableMarker from "./DraggableMarker";

interface MapContentProps {
  pickupLat: number | null;
  pickupLng: number | null;
  dropLat: number | null;
  dropLng: number | null;
  pickupNewlyPlaced?: boolean;
  dropNewlyPlaced?: boolean;
  userLocation: { lat: number; lng: number } | null;
  onMapClick: (lat: number, lng: number) => void;
  onMarkerDragEnd: (type: "pickup" | "drop", lat: number, lng: number) => void;
  onRouteFetched: (distanceKm: number, durationMin: number) => void;
  mapZoom: number;
}

const ORS_API = "https://api.openrouteservice.org/v2/directions/driving-car";

async function fetchRoute(
  pickupLng: number,
  pickupLat: number,
  dropLng: number,
  dropLat: number,
  apiKey: string
): Promise<{ distance: number; durationMin: number; coordinates: [number, number][] } | null> {
  const res = await fetch(ORS_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      coordinates: [
        [pickupLng, pickupLat],
        [dropLng, dropLat],
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const route = data?.features?.[0];
  if (!route) return null;
  const distanceM = route.properties?.segments?.[0]?.distance ?? 0;
  const durationSec = route.properties?.summary?.duration ?? route.properties?.segments?.[0]?.duration ?? 0;
  const coords = route.geometry?.coordinates ?? [];
  return {
    distance: distanceM / 1000,
    durationMin: durationSec / 60,
    coordinates: coords,
  };
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapUpdater({
  center,
  pickupLat,
  pickupLng,
  dropLat,
  dropLng,
  userLocation,
  zoomTo,
}: {
  center: [number, number];
  pickupLat: number | null;
  pickupLng: number | null;
  dropLat: number | null;
  dropLng: number | null;
  userLocation: { lat: number; lng: number } | null;
  zoomTo: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (pickupLat != null && dropLat != null && pickupLng != null && dropLng != null) {
      const bounds = L.latLngBounds(
        [pickupLat, pickupLng],
        [dropLat, dropLng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupLat != null && pickupLng != null) {
      map.setView([pickupLat, pickupLng], zoomTo);
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    } else {
      map.setView(center, 12);
    }
  }, [map, center, pickupLat, pickupLng, dropLat, dropLng, userLocation, zoomTo]);

  return null;
}

/** Haversine distance in km - fallback when route API unavailable */
function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function RouteLayer({
  pickupLng,
  pickupLat,
  dropLng,
  dropLat,
  onRouteFetched,
}: {
  pickupLng: number;
  pickupLat: number;
  dropLng: number;
  dropLat: number;
  onRouteFetched: (distanceKm: number, durationMin: number) => void;
}) {
  const [positions, setPositions] = useState<[number, number][] | null>(null);

  useEffect(() => {
    setPositions(null);
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY ?? process.env.NEXT_PUBLIC_ORS_API_KEY;

    if (apiKey) {
      fetchRoute(pickupLng, pickupLat, dropLng, dropLat, apiKey)
        .then((result) => {
          if (result) {
            setPositions(result.coordinates.map(([lng, lat]) => [lat, lng]));
            onRouteFetched(result.distance, result.durationMin);
          } else {
            fallbackDistance();
          }
        })
        .catch(() => fallbackDistance());
    } else {
      fallbackDistance();
    }

    function fallbackDistance() {
      const distKm = haversineKm(pickupLat, pickupLng, dropLat, dropLng);
      const durMin = Math.max(5, Math.ceil(distKm * 3)); // ~20 km/h city estimate
      onRouteFetched(distKm, durMin);
    }
  }, [pickupLng, pickupLat, dropLng, dropLat, onRouteFetched]);

  if (!positions || positions.length < 2) return null;

  return (
    <Polyline
      positions={positions}
      pathOptions={{ color: "#22c55e", weight: 4 }}
    />
  );
}

export default function MapContent({
  pickupLat,
  pickupLng,
  dropLat,
  dropLng,
  pickupNewlyPlaced = false,
  dropNewlyPlaced = false,
  userLocation,
  onMapClick,
  onMarkerDragEnd,
  onRouteFetched,
  mapZoom,
}: MapContentProps) {
  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [13.0827, 80.2707];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      className="relative z-0 h-full w-full"
      scrollWheelZoom={true}
      aria-label="Interactive map for selecting pickup and drop locations"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onClick={onMapClick} />
      <MapUpdater
        center={defaultCenter}
        pickupLat={pickupLat}
        pickupLng={pickupLng}
        dropLat={dropLat}
        dropLng={dropLng}
        userLocation={userLocation}
        zoomTo={mapZoom}
      />

      {pickupLat != null && pickupLng != null && (
        <DraggableMarker
          position={[pickupLat, pickupLng]}
          type="pickup"
          onDragEnd={onMarkerDragEnd}
          isNewlyPlaced={pickupNewlyPlaced}
        />
      )}

      {dropLat != null && dropLng != null && (
        <DraggableMarker
          position={[dropLat, dropLng]}
          type="drop"
          onDragEnd={onMarkerDragEnd}
          isNewlyPlaced={dropNewlyPlaced}
        />
      )}

      {pickupLat != null && pickupLng != null && dropLat != null && dropLng != null && (
        <RouteLayer
          pickupLng={pickupLng}
          pickupLat={pickupLat}
          dropLng={dropLng}
          dropLat={dropLat}
          onRouteFetched={onRouteFetched}
        />
      )}
    </MapContainer>
  );
}
