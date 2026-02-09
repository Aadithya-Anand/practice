"use client";
import { useRouter } from "next/navigation";

export default function FarePage({ params }: { params: { rideId: string } }) {
  const router = useRouter();

  return (
    <div style={{ padding: 20 }}>
      <h2>Fare Estimate</h2>
      <p>Ride ID: {params.rideId}</p>
      <p>Estimated Fare: ₹180</p>
      <button onClick={() => router.push(`/ride/${params.rideId}`)}>
        Confirm Ride
      </button>
    </div>
  );
}
