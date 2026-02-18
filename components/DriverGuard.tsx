"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export function DriverGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading, error } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "driver") {
      router.replace("/driver/signup");
      return;
    }
    if (error) {
      router.replace("/login");
    }
  }, [user, loading, error, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950">
        <Skeleton className="h-12 w-48 bg-zinc-800" />
        <Skeleton className="h-4 w-32 bg-zinc-800" />
      </div>
    );
  }

  if (!user || user.role !== "driver") {
    return null;
  }

  return <>{children}</>;
}
