"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const bookRide = () => {
    const rideId = Date.now().toString();
    router.push(`/fare/${rideId}`);
  };

  return (
    <main style={{ padding: 20 }}>
      <h2>Book a Ride</h2>
      <p>Pickup: Thiruvanmiyur</p>
      <p>Drop: Sholinganallur</p>
      <button onClick={bookRide}>Estimate Fare</button>
    </main>
  );
}
