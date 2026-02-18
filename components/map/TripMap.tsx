"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const ORS_API = "https://api.openrouteservice.org/v2/directions/driving-car";

interface TripMapProps {
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
  pickupAddress?: string;
  dropAddress?: string;
  className?: string;
}

const greenIcon = L.divIcon({
  html: '<div style="background:#22c55e;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>',
  className: "",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const redIcon = L.divIcon({
  html: '<div style="background:#ef4444;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>',
  className: "",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function TripMapInner({ pickupLat, pickupLng, dropLat, dropLng, pickupAddress, dropAddress }: TripMapProps) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_ORS_API_KEY;
    if (!key) return;
    fetch(ORS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: key,
      },
      body: JSON.stringify({
        coordinates: [
          [pickupLng, pickupLat],
          [dropLng, dropLat],
        ],
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        const coords = data?.features?.[0]?.geometry?.coordinates ?? [];
        setRouteCoords(coords.map((c: [number, number]) => [c[1], c[0]] as [number, number]));
      })
      .catch(() => {});
  }, [pickupLat, pickupLng, dropLat, dropLng]);

  const centerLat = (pickupLat + dropLat) / 2;
  const centerLng = (pickupLng + dropLng) / 2;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={13}
      className="h-full w-full rounded-xl"
      style={{ minHeight: 200 }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routeCoords.length > 0 && (
        <Polyline positions={routeCoords} color="#f97316" weight={4} opacity={0.8} />
      )}
      <Marker position={[pickupLat, pickupLng]} icon={greenIcon}>
        <Popup>{pickupAddress || "Pickup"}</Popup>
      </Marker>
      <Marker position={[dropLat, dropLng]} icon={redIcon}>
        <Popup>{dropAddress || "Drop"}</Popup>
      </Marker>
    </MapContainer>
  );
}

export default function TripMap(props: TripMapProps) {
  return (
    <div className={props.className ?? "h-[200px] w-full overflow-hidden rounded-xl border border-zinc-800"}>
      <TripMapInner {...props} />
    </div>
  );
}
