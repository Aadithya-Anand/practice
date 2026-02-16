"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useLocationSearch, type ForwardGeocodeResult } from "@/hooks/useLocationSearch";
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
  const { suggestions, loading, isWeakMatch, isEmpty, search, clear } = useLocationSearch();

  const debouncedValue = useDebounce(value, DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 3) {
      search(debouncedValue);
      setShowDropdown(true);
    } else {
      clear();
    }
  }, [debouncedValue, search, clear]);

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

  const borderColor =
    variant === "pickup"
      ? "border-green-500/60 focus:border-green-500"
      : variant === "drop"
        ? "border-blue-500/60 focus:border-blue-500"
        : "border-zinc-600 focus:border-orange-500";

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => (suggestions.length > 0 || loading) && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-lg border bg-zinc-800 px-4 py-2.5 pl-10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 ${borderColor}`}
      />
      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none">
          Searching...
        </span>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 z-[9999] mt-1 w-full overflow-hidden rounded-xl border border-zinc-600 bg-zinc-800 shadow-xl"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {isWeakMatch && (
            <div className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs text-amber-400">
              No exact building found. Showing nearby area.
            </div>
          )}
          <ul
            className="max-h-48 overflow-auto py-1"
            role="listbox"
          >
          {suggestions.map((result) => (
            <li
              key={result.placeId}
              role="option"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(result);
              }}
              className="flex cursor-pointer items-start gap-2 px-4 py-2 text-sm text-white hover:bg-zinc-700"
            >
              {hasBuilding(result) ? (
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
              ) : (
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              )}
              <span className="flex-1">{result.formattedAddress}</span>
            </li>
          ))}
          </ul>
        </div>
      )}

      {showDropdown && isEmpty && debouncedValue.length >= 3 && !loading && (
        <div
          className="absolute top-full left-0 z-[9999] mt-1 w-full rounded-xl border border-zinc-600 bg-zinc-800 px-4 py-3 text-sm text-zinc-400"
          onMouseDown={(e) => e.stopPropagation()}
        >
          No results. Try a different search or click on the map.
        </div>
      )}
    </div>
  );
}
