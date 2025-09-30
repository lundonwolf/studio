"use client";

import { useTrip } from "@/hooks/use-trip";
import { Header } from "./header";
import { TripPlanner } from "./trip-planner";
import { ActiveTrip } from "./active-trip";
import { MapView } from "./map-view";
import { HistoryAndReports } from "./history-and-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";

export default function Dashboard() {
  const { state, dispatch } = useTrip();
  const { state: settingsState } = useSettings();

   useEffect(() => {
    dispatch({ type: 'SET_STOPS', payload: settingsState.stops });
  }, [settingsState.stops, dispatch]);

  const renderTripState = () => {
    switch (state.tripStatus) {
      case "planning":
        return <TripPlanner />;
      case "active":
        return <ActiveTrip />;
      case "ended":
        return (
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <FileText className="text-primary" />
                End of Trip Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 text-left">
                <pre className="p-4 bg-secondary rounded-md whitespace-pre-wrap text-sm text-secondary-foreground font-sans">
                  {state.endOfTripReport}
                </pre>
              </ScrollArea>
              <Button onClick={() => dispatch({type: 'RESET_TRIP'})} className="mt-6">
                <RotateCcw className="mr-2 h-4 w-4" /> Start New Trip
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {renderTripState()}
          </div>
          <div className="space-y-8">
            <MapView />
            <HistoryAndReports />
          </div>
        </div>
      </main>
    </div>
  );
}
