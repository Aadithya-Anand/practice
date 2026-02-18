"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function DriverNavbar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/driver" className="flex items-center gap-2">
          <Car className="h-6 w-6 text-orange-500" />
          <span className="text-xl font-bold tracking-tight text-white">
            Vandi Driver
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/driver"
            className={`text-sm font-medium transition-colors ${
              pathname === "/driver" ? "text-orange-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/driver/trips"
            className={`text-sm font-medium transition-colors ${
              pathname === "/driver/trips" ? "text-orange-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            My trips
          </Link>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
