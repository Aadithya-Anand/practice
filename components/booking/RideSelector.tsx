"use client";

import { motion } from "framer-motion";
import { calculateFare, type VehicleType } from "@/lib/pricing";

interface Props {
  selected: string;
  onSelect: (vehicle: VehicleType) => void;
  distanceKm: number | null;
}

const VEHICLES: { type: VehicleType; label: string }[] = [
  { type: "MINI", label: "Mini" },
  { type: "SEDAN", label: "Sedan" },
  { type: "SUV", label: "SUV" },
];

export default function RideSelector({ selected, onSelect, distanceKm }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-400">Select vehicle type</p>
      <div className="space-y-2">
        {VEHICLES.map((v, i) => {
          const fare = distanceKm != null && distanceKm > 0
            ? calculateFare({ distanceKm, vehicleType: v.type }).totalFare
            : null;
          const isSelected = selected === v.type;
          return (
            <motion.div
              key={v.type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(v.type)}
              className={`relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 ${
                isSelected
                  ? "border-green-500/80 bg-zinc-800 shadow-[0_0_0_1px_rgba(34,197,94,0.2)]"
                  : "border-zinc-700 bg-zinc-900/80 hover:border-zinc-600 hover:bg-zinc-800/80"
              }`}
            >
              <span className="font-medium text-white">{v.label}</span>
              {fare != null && (
                <span className="font-semibold text-green-400">₹{fare}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
