export default function RatingPage({ params }: { params: { rideId: string } }) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Rate Your Ride ⭐</h2>
      <p>Ride ID: {params.rideId}</p>
      <button>⭐⭐⭐⭐⭐</button>
    </div>
  );
}
