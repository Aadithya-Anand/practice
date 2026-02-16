"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { tripsApi, type Trip } from "@/lib/api";

export type TripStatus = "SEARCHING" | "ACCEPTED" | "ARRIVING" | "STARTED" | "COMPLETED" | "CANCELLED";

const STATUS_ORDER: TripStatus[] = ["SEARCHING", "ACCEPTED", "ARRIVING", "STARTED", "COMPLETED"];

// Timing config (ms)
const SEARCHING_DURATION = 3000;
const ARRIVING_STEP_MS = 150;
const ARRIVING_STEPS = 20;
const STARTED_DURATION_MS = 8000; // Simulate 8s ride

export interface DriverSimulationState {
  trip: Trip | null;
  status: TripStatus;
  loading: boolean;
  error: string | null;
  /** 0-1 progress for ARRIVING phase (driver moving to pickup) */
  arrivingProgress: number;
  /** 0-1 progress for STARTED phase (ride in progress) */
  rideProgress: number;
  /** ETA seconds for ARRIVING */
  etaSeconds: number;
}

export function useDriverSimulation(tripId: string | null) {
  const [state, setState] = useState<DriverSimulationState>({
    trip: null,
    status: "SEARCHING",
    loading: true,
    error: null,
    arrivingProgress: 0,
    rideProgress: 0,
    etaSeconds: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const rideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateStatus = useCallback(async (newStatus: TripStatus) => {
    if (!tripId) return;
    try {
      const { trip } = await tripsApi.updateStatus(tripId, newStatus);
      setState((s) => ({ ...s, status: newStatus, trip }));
    } catch (err) {
      setState((s) => ({ ...s, error: (err as Error).message }));
    }
  }, [tripId]);

  // Fetch trip on mount
  useEffect(() => {
    if (!tripId) {
      setState((s) => ({ ...s, loading: false, error: "No trip ID" }));
      return;
    }

    tripsApi
      .getById(tripId)
      .then(({ trip }) => {
        setState((s) => ({
          ...s,
          trip,
          status: trip.status as TripStatus,
          loading: false,
        }));
      })
      .catch((err) => {
        setState((s) => ({
          ...s,
          loading: false,
          error: (err as Error).message,
        }));
      });
  }, [tripId]);

  // SEARCHING -> ACCEPTED (after 3s)
  useEffect(() => {
    if (state.status !== "SEARCHING" || !tripId) return;

    const timer = setTimeout(() => {
      updateStatus("ACCEPTED");
    }, SEARCHING_DURATION);

    return () => clearTimeout(timer);
  }, [state.status, tripId, updateStatus]);

  // ACCEPTED -> ARRIVING (immediate)
  useEffect(() => {
    if (state.status !== "ACCEPTED" || !tripId) return;
    updateStatus("ARRIVING");
  }, [state.status, tripId, updateStatus]);

  // ARRIVING: animate progress, then -> STARTED
  useEffect(() => {
    if (state.status !== "ARRIVING" || !tripId) return;

    let step = 0;
    const totalSteps = ARRIVING_STEPS;
    const stepMs = ARRIVING_STEP_MS;

    intervalRef.current = setInterval(() => {
      step += 1;
      const progress = step / totalSteps;
      const etaSeconds = Math.max(0, Math.round(((totalSteps - step) * stepMs) / 1000));

      setState((s) => ({
        ...s,
        arrivingProgress: progress,
        etaSeconds,
      }));

      if (step >= totalSteps) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        updateStatus("STARTED");
      }
    }, stepMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.status, tripId, updateStatus]);

  // STARTED: animate ride progress, then -> COMPLETED
  useEffect(() => {
    if (state.status !== "STARTED" || !tripId) return;

    const duration = Math.max(5000, (state.trip?.durationMin ?? 5) * 60 * 0.1); // 10% of actual duration for demo
    const stepMs = 100;
    const totalSteps = Math.ceil(duration / stepMs);
    let step = 0;

    rideIntervalRef.current = setInterval(() => {
      step += 1;
      const progress = Math.min(1, step / totalSteps);

      setState((s) => ({
        ...s,
        rideProgress: progress,
      }));

      if (progress >= 1) {
        if (rideIntervalRef.current) {
          clearInterval(rideIntervalRef.current);
          rideIntervalRef.current = null;
        }
        updateStatus("COMPLETED");
      }
    }, stepMs);

    return () => {
      if (rideIntervalRef.current) {
        clearInterval(rideIntervalRef.current);
      }
    };
  }, [state.status, tripId, updateStatus]);

  return state;
}
