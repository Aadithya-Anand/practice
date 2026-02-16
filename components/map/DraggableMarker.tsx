"use client";

import { useState, useCallback, useEffect } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { LeafletEventHandlerFnMap } from "leaflet";

/** Pickup: green. Drop: blue. Uber-style marker colors. */
const PICKUP_COLOR = "#22c55e";
const DROP_COLOR = "#3b82f6";

export interface DraggableMarkerProps {
  position: [number, number];
  type: "pickup" | "drop";
  onDragEnd: (type: "pickup" | "drop", lat: number, lng: number) => void;
  /** When true, show pulse animation (newly placed) */
  isNewlyPlaced?: boolean;
}

/**
 * Uber-style draggable marker with pulse animation when newly placed.
 * Pickup = green, Drop = blue. Business logic stays in MapView.
 */
export default function DraggableMarker({
  position: [lat, lng],
  type,
  onDragEnd,
  isNewlyPlaced = false,
}: DraggableMarkerProps) {
  const [pos, setPos] = useState<[number, number]>([lat, lng]);
  const [pulse, setPulse] = useState(isNewlyPlaced);

  useEffect(() => {
    setPos([lat, lng]);
  }, [lat, lng]);

  useEffect(() => {
    if (isNewlyPlaced) setPulse(true);
  }, [isNewlyPlaced]);

  // Clear pulse after animation completes
  useEffect(() => {
    if (!pulse) return;
    const t = setTimeout(() => setPulse(false), 2000);
    return () => clearTimeout(t);
  }, [pulse]);

  const color = type === "pickup" ? PICKUP_COLOR : DROP_COLOR;
  const label = type === "pickup" ? "P" : "D";

  const icon = L.divIcon({
    className: "custom-marker",
    html: `<div class="marker-pin ${pulse ? "marker-pulse" : ""}" style="background:${color};color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3)">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const handleDragEnd = useCallback(
    (e: L.LeafletEvent) => {
      const marker = e.target as L.Marker;
      const { lat, lng } = marker.getLatLng();
      setPos([lat, lng]);
      onDragEnd(type, lat, lng);
    },
    [type, onDragEnd]
  );

  const eventHandlers: LeafletEventHandlerFnMap = { dragend: handleDragEnd };

  return (
    <Marker position={pos} icon={icon} draggable eventHandlers={eventHandlers}>
      <Popup>
        {type === "pickup" ? "Pickup" : "Drop"} — Drag to exact entrance
      </Popup>
    </Marker>
  );
}
