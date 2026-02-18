"use client";

import { useState, useCallback, useEffect } from "react";
import type { MapLocation } from "@/types";

export type SavedPlaceLabel = "home" | "work" | "other";

export interface SavedPlace extends MapLocation {
  label: SavedPlaceLabel;
  labelDisplay: string;
}

const STORAGE_KEY = "vandi_saved_places";
const LABELS: Record<SavedPlaceLabel, string> = {
  home: "Home",
  work: "Work",
  other: "Other",
};

export function useSavedPlaces() {
  const [places, setPlaces] = useState<SavedPlace[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedPlace[];
        if (Array.isArray(parsed)) {
          setPlaces(parsed);
        }
      }
    } catch {
      setPlaces([]);
    }
  }, []);

  const addPlace = useCallback((loc: MapLocation, label: SavedPlaceLabel) => {
    const place: SavedPlace = {
      ...loc,
      label,
      labelDisplay: LABELS[label],
    };
    setPlaces((prev) => {
      const filtered = prev.filter((p) => p.label !== label);
      const next = [place, ...filtered];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const removePlace = useCallback((label: SavedPlaceLabel) => {
    setPlaces((prev) => {
      const next = prev.filter((p) => p.label !== label);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const getPlace = useCallback(
    (label: SavedPlaceLabel) => places.find((p) => p.label === label),
    [places]
  );

  return { places, addPlace, removePlace, getPlace };
}
