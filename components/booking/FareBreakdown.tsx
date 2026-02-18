"use client";

import { HelpCircle } from "lucide-react";
import type { PricingBreakdown } from "@/lib/pricing";

interface FareBreakdownProps {
  breakdown: PricingBreakdown;
  totalFare: number;
}

const SURGE_TIP =
  "Peak hours (5PM-8PM) and night hours (10PM-6AM) have a small fare multiplier for driver availability.";

export function FareBreakdown({ breakdown, totalFare }: FareBreakdownProps) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-zinc-400">
        <span>Base fare</span>
        <span>₹{breakdown.baseFare}</span>
      </div>
      <div className="flex justify-between text-zinc-400">
        <span>
          Distance ({breakdown.distanceKm.toFixed(1)} km × ₹{breakdown.perKmRate}/km)
        </span>
        <span>₹{Math.round(breakdown.distanceFare)}</span>
      </div>
      {breakdown.surgeApplied && breakdown.timeMultiplierLabel && (
        <div className="flex items-center justify-between text-amber-400">
          <span className="flex items-center gap-1">
            {breakdown.timeMultiplierLabel}
            <span
              title={SURGE_TIP}
              className="cursor-help"
              aria-label={SURGE_TIP}
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </span>
          </span>
          <span>×{breakdown.timeMultiplier}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-zinc-700 pt-2 font-semibold text-green-400">
        <span>Total</span>
        <span>₹{totalFare}</span>
      </div>
    </div>
  );
}
