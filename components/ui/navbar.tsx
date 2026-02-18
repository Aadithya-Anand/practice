"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Car, LogOut, MapPin, History, User, CarFront } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/book", label: "Book", icon: MapPin },
  { href: "/history", label: "History", icon: History },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/driver", label: "Drive", icon: CarFront },
];

export function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const isDarkPage = pathname === "/book" || pathname?.startsWith("/ride");

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-md ${
        isDarkPage
          ? "border-zinc-800/50 bg-zinc-950/95"
          : "border-slate-200/80 bg-white/95"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/book" className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500"
          >
            <Car className="h-5 w-5 text-white" />
          </motion.div>
          <span
            className={`text-lg font-bold tracking-tight ${isDarkPage ? "text-white" : "text-slate-900"}`}
          >
            Vandi
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== "/book" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isDarkPage
                    ? isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                    : isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => logout()}
            className={`ml-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isDarkPage
                ? "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
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