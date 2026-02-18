"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { tripsApi, type Trip } from "@/lib/api";

export type TripStatus = "SEARCHING" | "ACCEPTED" | "ARRIVING" | "STARTED" | "COMPLETED" | "CANCELLED";

const ARRIVING_ANIM_DURATION = 20;
const STARTED_ANIM_DURATION = 30;

const fetcher = (key: string) => {
  const tripId = key.replace("trip-", "");
  return tripsApi.getById(tripId).then((r) => r.trip);
};

export interface DriverSimulationState {
  trip: Trip | null;
  status: TripStatus;
  loading: boolean;
  error: string | null;
  arrivingProgress: number;
  rideProgress: number;
  etaSeconds: number;
  mutate: () => void;
}

export function useDriverSimulation(tripId: string | null) {
  const statusChangedAt = useRef<number>(0);

  const { data: trip, error, isLoading, mutate } = useSWR<Trip | null>(
    tripId ? `trip-${tripId}` : null,
    () => (tripId ? fetcher(tripId) : Promise.resolve(null)),
    {
      refreshInterval: 1500,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 500,
    }
  );

  const status = (trip?.status ?? "SEARCHING") as TripStatus;

  const [progress, setProgress] = useState({
    arrivingProgress: 0,
    rideProgress: 0,
    etaSeconds: 0,
  });

  useEffect(() => {
    if (status === "ARRIVING" || status === "STARTED") {
      statusChangedAt.current = Date.now();
    }
  }, [status]);

  useEffect(() => {
    if (status !== "ARRIVING" && status !== "STARTED") return;
    const start = statusChangedAt.current || Date.now();
    const duration = status === "ARRIVING" ? ARRIVING_ANIM_DURATION : STARTED_ANIM_DURATION;

    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const p = Math.min(1, elapsed / duration);
      setProgress({
        arrivingProgress: status === "ARRIVING" ? p : 0,
        rideProgress: status === "STARTED" ? p : 0,
        etaSeconds: status === "ARRIVING" ? Math.max(0, Math.round(duration - elapsed)) : 0,
      });
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [status]);

  return {
    trip: trip ?? null,
    status,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    arrivingProgress: progress.arrivingProgress,
    rideProgress: progress.rideProgress,
    etaSeconds: progress.etaSeconds,
    mutate,
  };
}
