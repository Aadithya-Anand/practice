"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { useLocationSearchContext } from "@/contexts/LocationSearchContext";
import type { ForwardGeocodeResult } from "@/lib/geocoding";
import { Building2, MapPin } from "lucide-react";

const DEBOUNCE_MS = 300;

export interface SearchSelectResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  rawAddress: Record<string, string>;
  isStrongMatch: boolean;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: SearchSelectResult) => void;
  placeholder: string;
  disabled?: boolean;
  /** Green border when pickup, blue when drop */
  variant?: "pickup" | "drop" | "default";
}

/**
 * Building-aware search with smart fallback UX.
 * - Shows top 5 nearby suggestions even when no exact building match
 * - "No exact building found. Showing nearby area." when isWeakMatch
 * - Still allows selection → zoom to area, enable draggable pin for precise adjustment
 */
export default function SearchInput({
  value,
  onChange,
  onSelect,
  placeholder,
  disabled = false,
  variant = "default",
}: SearchInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { suggestions, loading, isWeakMatch, isEmpty, search, clear } = useLocationSearchContext();

  const debouncedValue = useDebounce(value, DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 3) {
      search(debouncedValue);
      setShowDropdown(true);
    }
    // Don't clear on empty - shared context; other input may still need suggestions
  }, [debouncedValue, search]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const hasBuilding = (r: ForwardGeocodeResult) =>
    !!(r.rawAddress?.building || r.rawAddress?.house_number);

  const handleSelect = useCallback(
    (result: ForwardGeocodeResult) => {
      onChange(result.formattedAddress);
      onSelect({
        lat: result.lat,
        lng: result.lng,
        formattedAddress: result.formattedAddress,
        rawAddress: (result.rawAddress ?? {}) as Record<string, string>,
        isStrongMatch: hasBuilding(result),
      });
      setShowDropdown(false);
      clear();
    },
    [onChange, onSelect, clear]
  );

  const focusRing =
    variant === "pickup"
      ? "focus:border-green-500/80 focus:ring-2 focus:ring-green-500/20"
      : variant === "drop"
        ? "focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20"
        : "focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20";

  const showSuggestions = showDropdown && suggestions.length > 0;
  const showEmpty = showDropdown && isEmpty && debouncedValue.length >= 3 && !loading;

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => (suggestions.length > 0 || loading || debouncedValue.length >= 3) && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={variant === "pickup" ? "Pickup location search" : variant === "drop" ? "Drop location search" : "Location search"}
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-controls="location-suggestions"
        className={`w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 pl-10 text-white placeholder:text-zinc-500 transition-all duration-200 focus:outline-none ${focusRing}`}
      />
      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none">
          Searching...
        </span>
      )}

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-[9999] mt-2 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl ring-1 ring-zinc-800"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {isWeakMatch && (
              <div className="border-b border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-400">
                No exact building found. Showing nearby area.
              </div>
            )}
            <ul
              id="location-suggestions"
              className="max-h-52 overflow-auto py-1"
              role="listbox"
              aria-label="Location suggestions"
            >
              {suggestions.map((result, i) => (
                <motion.li
                  key={result.placeId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  role="option"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(result);
                  }}
                  className="flex cursor-pointer items-start gap-3 px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-zinc-800/80"
                >
                  {hasBuilding(result) ? (
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                  ) : (
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                  )}
                  <span className="flex-1 break-words">{result.formattedAddress}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {showEmpty && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-[9999] mt-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-sm text-zinc-400 shadow-2xl ring-1 ring-zinc-800"
            onMouseDown={(e) => e.stopPropagation()}
          >
            No results. Try a different search or click on the map.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
