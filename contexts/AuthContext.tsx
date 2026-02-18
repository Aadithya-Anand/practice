"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_ME = "/api/me";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ME, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          return;
        }
        throw new Error("Failed to fetch user");
      }
      const data = (await res.json()) as { user?: User };
      setUser(data.user ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth error");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setError(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
      router.replace("/login");
    }
  }, [router]);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    logout,
    refetch: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
