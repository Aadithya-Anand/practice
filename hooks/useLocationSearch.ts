"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { forwardGeocode, type ForwardGeocodeResult } from "@/lib/geocoding";

const DEBOUNCE_MS = 300;

/** Check if a result has building-level precision (building name or house number) */
function isStrongMatch(result: ForwardGeocodeResult): boolean {
  const raw = result.rawAddress ?? {};
  const building = raw.building;
  const houseNumber = raw.house_number;
  const toString = (v: unknown): string =>
    Array.isArray(v) ? (v[0] as string) ?? "" : (v as string) ?? "";
  return !!(toString(building) || toString(houseNumber));
}

export interface LocationSearchResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  rawAddress: Record<string, string>;
  /** True if result has building/house_number - strong match */
  isStrongMatch: boolean;
}

export interface UseLocationSearchReturn {
  suggestions: ForwardGeocodeResult[];
  loading: boolean;
  /** True when top result has no building/house_number - show fallback UX */
  isWeakMatch: boolean;
  /** True when search returned empty - user may still select from map */
  isEmpty: boolean;
  search: (query: string) => void;
  clear: () => void;
}

/**
 * Use Nominatim forward search with smart fallback detection.
 * UX: Don't rely on exact building name detection.
 * - Show top 5 nearby suggestions even when no building match
 * - isWeakMatch = true when best result is area-level only → show "No exact building found"
 * - Still allow selection and pin adjustment for precise location
 */
export function useLocationSearch(): UseLocationSearchReturn {
  const [suggestions, setSuggestions] = useState<ForwardGeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isWeakMatch, setIsWeakMatch] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      setIsWeakMatch(false);
      setIsEmpty(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setIsWeakMatch(false);
    setIsEmpty(false);

    try {
      const results = await forwardGeocode(query, abortRef.current.signal);
      setSuggestions(results);
      setIsEmpty(results.length === 0);

      // Strong match = top result has building or house_number
      const topResult = results[0];
      if (topResult) {
        setIsWeakMatch(!isStrongMatch(topResult));
      } else {
        setIsWeakMatch(false);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setSuggestions([]);
        setIsWeakMatch(false);
        setIsEmpty(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setSuggestions([]);
    setLoading(false);
    setIsWeakMatch(false);
    setIsEmpty(false);
  }, []);

  return { suggestions, loading, isWeakMatch, isEmpty, search, clear };
}

export type { ForwardGeocodeResult };
