"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { forwardGeocode, type ForwardGeocodeResult } from "@/lib/geocoding";

interface LocationSearchContextValue {
  suggestions: ForwardGeocodeResult[];
  loading: boolean;
  isWeakMatch: boolean;
  isEmpty: boolean;
  search: (query: string) => void;
  clear: () => void;
}

const LocationSearchContext = createContext<LocationSearchContextValue | null>(null);

function isStrongMatch(result: ForwardGeocodeResult): boolean {
  const raw = result.rawAddress ?? {};
  const building = raw.building;
  const houseNumber = raw.house_number;
  const toString = (v: unknown): string =>
    Array.isArray(v) ? (v[0] as string) ?? "" : (v as string) ?? "";
  return !!(toString(building) || toString(houseNumber));
}

const CACHE_MAX = 50;
const cache = new Map<string, ForwardGeocodeResult[]>();

export function LocationSearchProvider({ children }: { children: ReactNode }) {
  const [suggestions, setSuggestions] = useState<ForwardGeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isWeakMatch, setIsWeakMatch] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 3) {
      setSuggestions([]);
      setIsWeakMatch(false);
      setIsEmpty(false);
      return;
    }

    const cacheKey = trimmed.toLowerCase();
    const cached = cache.get(cacheKey);
    if (cached) {
      setSuggestions(cached);
      setIsEmpty(cached.length === 0);
      setIsWeakMatch(cached[0] ? !isStrongMatch(cached[0]) : false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setIsWeakMatch(false);
    setIsEmpty(false);

    try {
      const results = await forwardGeocode(trimmed, abortRef.current.signal);
      if (cache.size >= CACHE_MAX) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }
      cache.set(cacheKey, results);

      setSuggestions(results);
      setIsEmpty(results.length === 0);
      const topResult = results[0];
      setIsWeakMatch(topResult ? !isStrongMatch(topResult) : false);
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

  const value: LocationSearchContextValue = {
    suggestions,
    loading,
    isWeakMatch,
    isEmpty,
    search,
    clear,
  };

  return (
    <LocationSearchContext.Provider value={value}>
      {children}
    </LocationSearchContext.Provider>
  );
}

export function useLocationSearchContext() {
  const ctx = useContext(LocationSearchContext);
  if (!ctx) {
    throw new Error("useLocationSearchContext must be used within LocationSearchProvider");
  }
  return ctx;
}
