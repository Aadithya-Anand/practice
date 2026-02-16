"use client";

import { useState, useCallback, useRef } from "react";
import { reverseGeocode, type ReverseGeocodeResult } from "@/lib/geocoding";

const FALLBACK_MESSAGE = "Address unavailable, but precise location saved.";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

export interface UseReverseGeocodeState {
  result: ReverseGeocodeResult | null;
  loading: boolean;
  error: string | null;
}

export function useReverseGeocode() {
  const [state, setState] = useState<UseReverseGeocodeState>({
    result: null,
    loading: false,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const fetchAddress = useCallback(async (
    lat: number,
    lng: number,
    retryCount = 0
  ): Promise<{ result: ReverseGeocodeResult; isFallback: boolean } | null> => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const result = await reverseGeocode(lat, lng, abortRef.current.signal);

      if (result) {
        setState({
          result,
          loading: false,
          error: null,
        });
        return { result, isFallback: false };
      }

      // Nominatim may return null for some locations - retry with backoff
      if (retryCount < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        return fetchAddress(lat, lng, retryCount + 1);
      }

      // Fallback: use coordinates as address
      const fallbackResult: ReverseGeocodeResult = {
        latitude: lat,
        longitude: lng,
        formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        rawAddress: {},
        displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      };
      setState({
        result: fallbackResult,
        loading: false,
        error: FALLBACK_MESSAGE,
      });
      return { result: fallbackResult, isFallback: true };
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setState((s) => ({ ...s, loading: false }));
        return null;
      }
      if (retryCount < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        return fetchAddress(lat, lng, retryCount + 1);
      }
      // Keep coordinates on failure - Uber-style: precise location saved
      const fallbackResult: ReverseGeocodeResult = {
        latitude: lat,
        longitude: lng,
        formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        rawAddress: {},
        displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      };
      setState({
        result: fallbackResult,
        loading: false,
        error: FALLBACK_MESSAGE,
      });
      return { result: fallbackResult, isFallback: true };
    } finally {
      abortRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setState({ result: null, loading: false, error: null });
  }, []);

  return { ...state, fetchAddress, reset };
}
