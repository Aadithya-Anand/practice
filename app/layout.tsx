import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
          <Link href="/">Home</Link> |{" "}
          <Link href="/history">History</Link> |{" "}
          <Link href="/profile">Profile</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
