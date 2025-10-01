"use client";

import { createContext, useReducer, ReactNode, Dispatch, useEffect } from "react";
import type { Stop, CheckoutReason } from "@/lib/types";
import { availableStops as defaultStops } from "@/lib/data";
import { defaultReasons, defaultSuccessfulReasons } from "@/lib/reasons";

type State = {
  stops: Stop[];
  reasons: CheckoutReason[];
  successfulReasons: CheckoutReason[];
};

type Action =
  | { type: "ADD_REASON"; payload: { text: string } }
  | { type: "DELETE_REASON"; payload: string }
  | { type: "ADD_SUCCESSFUL_REASON"; payload: { text: string } }
  | { type: "DELETE_SUCCESSFUL_REASON"; payload: string }
  | { type: "HYDRATE_STATE"; payload: Partial<State> }
  | { type: "REORDER_ITEMS"; payload: { type: 'reasons' | 'successfulReasons' | 'stops'; sourceIndex: number; destinationIndex: number }}
  | { type: "ADD_STOP"; payload: Omit<Stop, 'id' | 'coordinates'> }
  | { type: "UPDATE_STOP"; payload: Omit<Stop, 'coordinates'> }
  | { type: "DELETE_STOP"; payload: string };

const defaultState: State = {
  stops: defaultStops,
  reasons: defaultReasons,
  successfulReasons: defaultSuccessfulReasons,
};

function settingsReducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE_STATE":
        return { ...state, ...action.payload };
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
     case 'REORDER_ITEMS': {
      const { type, sourceIndex, destinationIndex } = action.payload;
      const list = [...state[type]];
      const [removed] = list.splice(sourceIndex, 1);
      list.splice(destinationIndex, 0, removed);
      return { ...state, [type]: list };
    }
    case 'ADD_STOP': {
      const newStop: Stop = {
        id: `stop-${Date.now()}`,
        ...action.payload,
      };
      return { ...state, stops: [...state.stops, newStop] };
    }
    case 'UPDATE_STOP': {
      return {
        ...state,
        stops: state.stops.map(stop => stop.id === action.payload.id ? {...stop, ...action.payload} : stop),
      };
    }
    case 'DELETE_STOP':
      return {
        ...state,
        stops: state.stops.filter(stop => stop.id !== action.payload),
      };
    default:
      return state;
  }
}

export const SettingsContext = createContext<{ state: State; dispatch: Dispatch<Action> } | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'bulletin-tracker-settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, defaultState);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const storedState = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedState) {
        const loadedState = JSON.parse(storedState);
        const stateToHydrate = {
            ...defaultState,
            stops: loadedState.stops || defaultState.stops,
            reasons: loadedState.reasons || defaultState.reasons,
            successfulReasons: loadedState.successfulReasons || defaultState.successfulReasons,
        }
        dispatch({ type: 'HYDRATE_STATE', payload: stateToHydrate });
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [state]);

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
}
