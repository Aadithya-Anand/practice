"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Debounce a value - delays updates until after delayMs of no changes
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Debounced callback - returns a function that debounces invocations
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  const timeoutRef = { current: null as NodeJS.Timeout | null };
  const callbackRef = { current: callback };
  callbackRef.current = callback;

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = null;
      }, delayMs);
    },
    [delayMs]
  );
}
