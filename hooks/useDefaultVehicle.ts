"use client";

import { useState, useCallback, useEffect } from "react";
import type { VehicleType } from "@/types";

const STORAGE_KEY = "vandi_default_vehicle";

export function useDefaultVehicle() {
  const [vehicle, setVehicleState] = useState<VehicleType>("MINI");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && ["MINI", "SEDAN", "SUV"].includes(raw)) {
        setVehicleState(raw as VehicleType);
      }
    } catch {
      // ignore
    }
  }, []);

  const setVehicle = useCallback((v: VehicleType) => {
    setVehicleState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      // ignore
    }
  }, []);

  return { vehicle, setVehicle };
}
