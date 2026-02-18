"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Activity, User, CreditCard, Bell } from "lucide-react";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthGuard } from "@/components/AuthGuard";
import { Navbar } from "@/components/ui/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { meApi } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, logout, refetch } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    if (user) setName(user.name ?? "");
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await meApi.updateProfile({ name: name.trim() || undefined });
      await refetch();
      setEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
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
                {loading ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-40" />
                      </div>
                    </div>
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                ) : !user ? (
                  <EmptyState
                    variant="light"
                    icon={<User className="h-8 w-8" />}
                    title="Session expired"
                    description="Your session may have expired. Please sign in again to view your profile."
                    action={
                      <Link
                        href="/login"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
                      >
                        Sign in
                      </Link>
                    }
                  />
                ) : (
                  <>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">
                          {(user.name || user.email)?.charAt(0).toUpperCase() ?? "V"}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-600">Email</p>
                          <p className="text-base font-semibold">{user.email}</p>
                          {editing ? (
                            <div className="mt-2 flex gap-2">
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                              />
                              <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                                {saving ? "Saving..." : "Save"}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setName(user?.name ?? ""); }}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center gap-2">
                              <p className="text-base text-slate-800">{user.name || "—"}</p>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(true)}>
                                Edit name
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        Keep your contact details up to date so dispatch and support can
                        reach you when needed.
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Account status</p>
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
                        <CreditCard className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-semibold">Payment methods</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Add UPI, cards, or wallets for seamless checkout. (Demo: stored locally)
                      </p>
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                        UPI · Card · Wallet — Coming soon
                      </div>

                      <div className="flex items-center gap-2 text-slate-800 pt-2">
                        <Bell className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-semibold">Notifications</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Trip updates, driver arrival, and promotions.
                      </p>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-xs">Enable trip notifications</span>
                      </label>

                      <div className="flex items-center gap-2 text-slate-800 pt-2">
                        <ShieldCheck className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-semibold">Account security</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Vandi uses secure local storage for this demo build.
                      </p>
                      <ul className="space-y-1 text-xs">
                        <li>• Keep your password private.</li>
                        <li>• Always log out on shared devices.</li>
                        <li>• Contact support if you notice unusual activity.</li>
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
        </Card>
      </motion.div>
    </div>
    </div>
    </AuthGuard>
  );
}

