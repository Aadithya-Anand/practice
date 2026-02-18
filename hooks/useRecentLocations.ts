"use client";

import { useState, useCallback, useEffect } from "react";
import type { MapLocation } from "@/types";

const STORAGE_KEY = "vandi_recent_locations";
const MAX_RECENT = 5;

export function useRecentLocations() {
  const [locations, setLocations] = useState<MapLocation[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MapLocation[];
        if (Array.isArray(parsed)) {
          setLocations(parsed.slice(0, MAX_RECENT));
        }
      }
    } catch {
      setLocations([]);
    }
  }, []);

  const addLocation = useCallback((loc: MapLocation, type: "pickup" | "drop") => {
    setLocations((prev) => {
      const filtered = prev.filter(
        (l) =>
          !(Math.abs(l.lat - loc.lat) < 1e-6 && Math.abs(l.lng - loc.lng) < 1e-6)
      );
      const next = [loc, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setLocations([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { locations, addLocation, clearRecent };
}
