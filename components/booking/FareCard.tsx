"use client";

interface Props {
  pickup: string;
  drop: string;
  rideType: string;
  fare: number;
}

export default function FareCard({ pickup, drop, rideType, fare }: Props) {

  return (
    <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
      <h3 className="font-semibold mb-2">Ride Summary</h3>
      <p className="text-sm text-gray-400">From: {pickup}</p>
      <p className="text-sm text-gray-400">To: {drop}</p>
      <p className="mt-2 font-bold text-green-400">
        Total Fare: ₹{fare}
      </p>
    </div>
  );
}
