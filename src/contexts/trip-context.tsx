"use client";

import { createContext, useReducer, ReactNode, Dispatch, useContext } from "react";
import type { Stop, CheckInEvent, TripStatus, CheckOutStatus } from "@/lib/types";
import { SettingsContext } from "./settings-context";

type State = {
  tripStatus: TripStatus;
  itinerary: Stop[];
  activeStopIndex: number | null;
  history: CheckInEvent[];
  currentLocation: { latitude: number; longitude: number } | null;
  tripStartTime: Date | null;
  endOfTripReport: string | null;
  allStops: Stop[];
};

type Action =
  | { type: "ADD_TO_ITINERARY"; payload: Stop }
  | { type: "REMOVE_FROM_ITINERARY"; payload: string }
  | { type: "START_TRIP" }
  | { type: "CHECK_IN"; payload: { stopId: string } }
  | { type: "CHECK_OUT"; payload: { notes: string; status: CheckOutStatus; reason: string } }
  | { type: "SET_CURRENT_LOCATION"; payload: { latitude: number; longitude: number } }
  | { type: "END_TRIP"; payload: { report: string } }
  | { type: "RESET_TRIP" }
  | { type: 'SET_STOPS', payload: Stop[] };

const initialState: Omit<State, 'allStops'> = {
  tripStatus: "planning",
  itinerary: [],
  activeStopIndex: null,
  history: [],
  currentLocation: null,
  tripStartTime: null,
  endOfTripReport: null,
};

function tripReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STOPS':
      return {
        ...state,
        allStops: action.payload,
      };
    case "ADD_TO_ITINERARY":
      if (state.itinerary.find(stop => stop.id === action.payload.id)) {
        return state;
      }
      return { ...state, itinerary: [...state.itinerary, action.payload] };
    
    case "REMOVE_FROM_ITINERARY":
      return { ...state, itinerary: state.itinerary.filter(stop => stop.id !== action.payload) };

    case "START_TRIP":
      if (state.itinerary.length === 0) return { ...state };
      return {
        ...state,
        tripStatus: "active",
        tripStartTime: new Date(),
        activeStopIndex: 0,
        history: [],
        endOfTripReport: null,
      };

    case "CHECK_IN": {
      if (state.tripStatus !== "active") return state;
      const stopIndex = state.itinerary.findIndex(s => s.id === action.payload.stopId);
      if (stopIndex === -1) return state;

      const stop = state.itinerary[stopIndex];
      const newHistory: CheckInEvent = {
        stopId: stop.id,
        propertyName: stop.propertyName,
        timeIn: new Date(),
        timeOut: null,
        coordinates: stop.coordinates,
      };
      
      return {
        ...state,
        activeStopIndex: stopIndex,
        history: [...state.history.filter(h => h.stopId !== newHistory.stopId), newHistory],
      };
    }
    
    case "CHECK_OUT": {
        if (state.tripStatus !== "active" || state.activeStopIndex === null) return state;
        
        const currentStop = state.itinerary[state.activeStopIndex];
        if (!currentStop) return state;

        const updatedHistory = state.history.map(event =>
            event.stopId === currentStop.id && event.timeOut === null
                ? { ...event, timeOut: new Date(), notes: action.payload.notes, status: action.payload.status, reason: action.payload.reason }
                : event
        );

        const nextStopIndex = state.activeStopIndex + 1;
        
        return {
            ...state,
            history: updatedHistory,
            activeStopIndex: nextStopIndex < state.itinerary.length ? nextStopIndex : null,
        };
    }

    case "SET_CURRENT_LOCATION":
      return { ...state, currentLocation: action.payload };

    case "END_TRIP":
      return { ...state, tripStatus: "ended", endOfTripReport: action.payload.report };

    case "RESET_TRIP":
      return {
        ...state,
        ...initialState,
        itinerary: [],
      };

    default:
      return state;
  }
}

export const TripContext = createContext<{
    state: State;
    dispatch: Dispatch<Action>;
} | undefined>(undefined);


export function TripProvider({ children }: { children: ReactNode }) {
  const settingsContext = useContext(SettingsContext);
  if (!settingsContext) {
    throw new Error("TripProvider must be used within a SettingsProvider");
  }
  const { state: settingsState } = settingsContext;

  const combinedInitialState = {
    ...initialState,
    allStops: settingsState.stops,
  };

  const [state, dispatch] = useReducer(tripReducer, combinedInitialState);
  
  const value = {
      state: {
          ...state,
          allStops: settingsState.stops, // Always use the latest stops from settings
      },
      dispatch
  };

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
}
