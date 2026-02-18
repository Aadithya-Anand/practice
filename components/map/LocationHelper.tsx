"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export interface LocationHelperProps {
  /** Zoom level - show precision badge when >= 18 */
  mapZoom: number;
  /** True when at least one marker is placed */
  hasMarker: boolean;
  /** True when user dragged a marker (manually adjusted) */
  manuallyAdjusted: boolean;
  /** True when reverse geocode is running (adjusting location) */
  isAdjusting: boolean;
}

/**
 * Uber-style UX helper: badges and guidance text.
 * - "Building-level precision" when zoom >= 18
 * - "Precise location saved" when user dragged the pin
 * - "Can't find your building? Drag the pin to exact entrance."
 * Business logic stays outside; this is pure presentation.
 */
export default function LocationHelper({
  mapZoom,
  hasMarker,
  manuallyAdjusted,
  isAdjusting,
}: LocationHelperProps) {
  const showPrecisionBadge = mapZoom >= 18 && hasMarker;
  const showSavedBadge = manuallyAdjusted && !isAdjusting;

  return (
    <div className="space-y-2">
      {/* Top-left: loading indicator when adjusting */}
      {isAdjusting && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-4 top-4 z-10 rounded-lg bg-zinc-900/90 px-3 py-2 text-xs text-zinc-300"
        >
          Adjusting location...
        </motion.div>
      )}

      {/* Top-right: badges */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        {showSavedBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 rounded-lg border border-green-500/40 bg-zinc-900/90 px-3 py-2 text-xs text-green-400"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Precise location saved
          </motion.div>
        )}
        {showPrecisionBadge && !showSavedBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-green-500/40 bg-zinc-900/90 px-3 py-2 text-xs text-green-400"
          >
            Building-level precision
          </motion.div>
        )}
      </div>

    </div>
  );
}
