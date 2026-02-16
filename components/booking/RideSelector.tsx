"use client";

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
      {VEHICLES.map((v) => {
        const fare = distanceKm != null && distanceKm > 0
          ? calculateFare({ distanceKm, vehicleType: v.type }).totalFare
          : null;
        return (
          <div
            key={v.type}
            onClick={() => onSelect(v.type)}
            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border transition ${
              selected === v.type
                ? "border-green-500 bg-zinc-800"
                : "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            <span>{v.label}</span>
            {fare != null && (
              <span className="font-semibold text-green-400">₹{fare}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
