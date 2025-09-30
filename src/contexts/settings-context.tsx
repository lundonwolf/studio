"use client";

import { createContext, useReducer, ReactNode, Dispatch } from "react";
import type { Stop, CheckoutReason } from "@/lib/types";
import { availableStops } from "@/lib/data";
import { defaultReasons, defaultSuccessfulReasons } from "@/lib/reasons";

type State = {
  stops: Stop[];
  reasons: CheckoutReason[];
  successfulReasons: CheckoutReason[];
};

type Action =
  | { type: "ADD_STOP"; payload: Omit<Stop, 'id' | 'coordinates'> }
  | { type: "UPDATE_STOP"; payload: Stop }
  | { type: "DELETE_STOP"; payload: string }
  | { type: "ADD_REASON"; payload: { text: string } }
  | { type: "DELETE_REASON"; payload: string }
  | { type: "ADD_SUCCESSFUL_REASON"; payload: { text: string } }
  | { type: "DELETE_SUCCESSFUL_REASON"; payload: string };

const initialState: State = {
  stops: availableStops,
  reasons: defaultReasons,
  successfulReasons: defaultSuccessfulReasons,
};

function settingsReducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_STOP": {
      const newStop: Stop = {
        id: `stop-${Date.now()}`,
        ...action.payload,
        coordinates: { latitude: 0, longitude: 0 }, // Placeholder coordinates
      };
      return { ...state, stops: [...state.stops, newStop] };
    }
    case "UPDATE_STOP":
      return {
        ...state,
        stops: state.stops.map(stop => stop.id === action.payload.id ? action.payload : stop),
      };
    case "DELETE_STOP":
      return {
        ...state,
        stops: state.stops.filter(stop => stop.id !== action.payload),
      };
    case "ADD_REASON": {
      const newReason: CheckoutReason = {
        id: `reason-${Date.now()}`,
        text: action.payload.text,
      };
      return { ...state, reasons: [...state.reasons, newReason] };
    }
    case "DELETE_REASON":
      return {
        ...state,
        reasons: state.reasons.filter(reason => reason.id !== action.payload),
      };
    case "ADD_SUCCESSFUL_REASON": {
        const newReason: CheckoutReason = {
            id: `success-reason-${Date.now()}`,
            text: action.payload.text,
        };
        return { ...state, successfulReasons: [...state.successfulReasons, newReason] };
    }
    case "DELETE_SUCCESSFUL_REASON":
        return {
            ...state,
            successfulReasons: state.successfulReasons.filter(reason => reason.id !== action.payload),
        };
    default:
      return state;
  }
}

export const SettingsContext = createContext<{ state: State; dispatch: Dispatch<Action> } | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
}
