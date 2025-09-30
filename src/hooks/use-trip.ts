"use client";

import { useContext } from "react";
import { TripContext } from "@/contexts/trip-context";

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
};
