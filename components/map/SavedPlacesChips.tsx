"use client";

import { motion } from "framer-motion";
import { Home, Briefcase, MapPin } from "lucide-react";
import type { SavedPlace } from "@/hooks/useSavedPlaces";

interface SavedPlacesChipsProps {
  places: SavedPlace[];
  onSelect: (loc: SavedPlace) => void;
  variant: "pickup" | "drop";
}

const ICONS = {
  home: Home,
  work: Briefcase,
  other: MapPin,
};

export function SavedPlacesChips({
  places,
  onSelect,
  variant,
}: SavedPlacesChipsProps) {
  if (places.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {places.map((place, i) => {
        const Icon = ICONS[place.label];
        return (
          <motion.button
            key={`${place.label}-${place.lat}`}
            type="button"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(place)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-600 bg-zinc-800/80 px-3 py-2 text-left text-xs text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            aria-label={`Use ${place.labelDisplay} as ${variant}`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
            <span className="font-medium text-zinc-200">{place.labelDisplay}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
