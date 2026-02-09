"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookPage() {
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [rideId, setRideId] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  const bookRide = () => {
    const id = "RIDE-" + Date.now();
    setRideId(id);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Book Ride 🚕</h2>

      <input
        placeholder="Pickup location"
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Drop location"
        value={drop}
        onChange={(e) => setDrop(e.target.value)}
      />
      <br /><br />

      <button onClick={bookRide}>Book Ride</button>

      {rideId && (
        <>
          <p>✅ Ride Confirmed</p>
          <p><strong>Ride ID:</strong> {rideId}</p>
          <p>{pickup} → {drop}</p>
        </>
      )}
    </div>
  );
}
