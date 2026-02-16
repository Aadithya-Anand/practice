"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, Activity } from "lucide-react";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/ui/navbar";

interface User {
  id: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => {
        if (!res.ok) {
          router.replace("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      if (typeof window !== "undefined") localStorage.removeItem("user");
      toast.success("Signed out", {
        description: "You have been logged out of Vandi.",
      });
    } catch {
      // ignore
    } finally {
      router.replace("/login");
    }
  };

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-slate-100">
      <Navbar />
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-orange-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
        className="relative z-10 w-full max-w-3xl"
      >
        <Card className="border border-white/60 bg-white/80 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
            <CardDescription className="text-slate-500">
              Driver identity and account status.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-[1.3fr,1fr]">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">
                  {user?.email ? user.email.charAt(0).toUpperCase() : "V"}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Email</p>
                  <p className="text-base font-semibold">
                    {user?.email ?? "Loading..."}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Keep your contact details up to date so dispatch and support can
                reach you when needed.
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Account status
                  </p>
                  <p className="flex items-center gap-1.5 text-base font-semibold text-emerald-600">
                    <Activity className="h-4 w-4" />
                    Active
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="rounded-xl border-slate-300 text-slate-900 hover:bg-orange-50 hover:border-orange-300"
                  onClick={handleLogout}
                >
                  Log out
                </Button>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-100 bg-white/70 p-4 text-sm text-slate-700">
              <div className="flex items-center gap-2 text-slate-800">
                <ShieldCheck className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-semibold">Account security</span>
              </div>
              <p className="text-xs text-slate-500">
                Vandi uses secure local storage for this demo build. In a real
                deployment, this would be backed by encrypted tokens and server
                sessions.
              </p>
              <ul className="space-y-1 text-xs">
                <li>• Keep your password private.</li>
                <li>• Always log out on shared devices.</li>
                <li>• Contact support if you notice unusual activity.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </div>
    </AuthGuard>
  );
}
