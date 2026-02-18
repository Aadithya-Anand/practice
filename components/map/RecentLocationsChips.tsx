"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { MapLocation } from "@/types";

interface RecentLocationsChipsProps {
  locations: MapLocation[];
  onSelect: (loc: MapLocation) => void;
  variant: "pickup" | "drop";
}

export function RecentLocationsChips({
  locations,
  onSelect,
  variant,
}: RecentLocationsChipsProps) {
  if (locations.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {locations.map((loc, i) => (
        <motion.button
          key={`${loc.lat}-${loc.lng}-${i}`}
          type="button"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: i * 0.03 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(loc)}
          className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-xl border border-zinc-600 bg-zinc-800/80 px-3 py-2 text-left text-xs text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          aria-label={`Use ${loc.formattedAddress} as ${variant}`}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          <span className="line-clamp-1 max-w-[180px]">{loc.formattedAddress}</span>
        </motion.button>
      ))}
    </div>
  );
}
