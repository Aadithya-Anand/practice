import Link from "next/link";

export default function HistoryPage() {
  const rides = ["101", "102", "103"];

  return (
    <div style={{ padding: 20 }}>
      <h2>Ride History</h2>
      <ul>
        {rides.map(id => (
          <li key={id}>
            <Link href={`/ride/${id}`}>Ride #{id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
