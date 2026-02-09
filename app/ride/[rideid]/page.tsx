"use client";
import { useRouter } from "next/navigation";

export default function RidePage({ params }: { params: { rideId: string } }) {
  const router = useRouter();

  return (
    <div style={{ padding: 20 }}>
      <h2>Ride Ongoing 🚕</h2>
      <p>Ride ID: {params.rideId}</p>
      <p>Driver: Kumar</p>
      <p>Status: On the way</p>
      <button onClick={() => router.push(`/rating/${params.rideId}`)}>
        End Ride
      </button>
    </div>
  );
}
