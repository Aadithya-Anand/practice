"use client";

import useSWR from "swr";
import { tripsApi, type Trip } from "@/lib/api";

const TRIPS_KEY = "/api/trips";

async function fetcher(): Promise<{ trips: Trip[] }> {
  return tripsApi.list();
}

export function useTrips() {
  const { data, error, isLoading, mutate } = useSWR(TRIPS_KEY, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  return {
    trips: data?.trips ?? [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
    mutate,
  };
}
