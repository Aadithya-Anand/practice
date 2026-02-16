import Link from "next/link";
import { Laptop } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Laptop className="h-6 w-6 text-orange-500" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Vandi
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/book" className="hover:text-slate-900 transition-colors">
            Book
          </Link>
          <Link
            href="/history"
            className="hover:text-slate-900 transition-colors"
          >
            History
          </Link>
          <Link
            href="/profile"
            className="hover:text-slate-900 transition-colors"
          >
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}