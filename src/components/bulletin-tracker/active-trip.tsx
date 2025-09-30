"use client";

import { useState } from "react";
import { useTrip } from "@/hooks/use-trip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { LogIn, LogOut, MapPin, Wifi, Info, Clipboard, ChevronRight, CheckCircle2 } from "lucide-react";
import EndOfTripDialog from "./end-of-trip-dialog";

export function ActiveTrip() {
  const { state, dispatch } = useTrip();
  const { itinerary, activeStopIndex, history } = state;
  const [notes, setNotes] = useState("");
  const [isEndTripDialogOpen, setEndTripDialogOpen] = useState(false);

  if (activeStopIndex === null && itinerary.length > 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center bg-green-50 border-green-200">
         <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        <CardTitle>Trip Completed!</CardTitle>
        <p className="text-muted-foreground mt-2">All stops have been visited. You can now generate your end-of-trip report.</p>
        <Button onClick={() => setEndTripDialogOpen(true)} className="mt-6">Generate End of Trip Report</Button>
        <EndOfTripDialog isOpen={isEndTripDialogOpen} onOpenChange={setEndTripDialogOpen} />
      </Card>
    )
  }

  const currentStop = activeStopIndex !== null ? itinerary[activeStopIndex] : null;
  if (!currentStop) return null;

  const currentEvent = history.find(e => e.stopId === currentStop.id && e.timeOut === null);
  const isCheckedIn = !!currentEvent;

  const handleCheckIn = () => {
    dispatch({ type: "CHECK_IN", payload: { stopId: currentStop.id } });
  };

  const handleCheckOut = () => {
    dispatch({ type: "CHECK_OUT", payload: { notes } });
    setNotes("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Stop: {currentStop.propertyName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground"><MapPin size={16} /> {currentStop.address}</div>
          <div className="flex items-center gap-2 text-muted-foreground"><Clipboard size={16} /> Screen ID: {currentStop.screenId}</div>
          <div className="flex items-center gap-2 text-muted-foreground"><Wifi size={16} /> Wi-Fi: {currentStop.wifiSsid}</div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <h4 className="font-semibold flex items-center gap-2"><Info size={16} /> Tech Instructions</h4>
            <p className="text-muted-foreground text-sm mt-1">{currentStop.techInstructions}</p>
          </div>

          {!isCheckedIn ? (
            <Button onClick={handleCheckIn} className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Check-in
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="tech-notes" className="font-semibold text-sm">Tech Notes</label>
                <Textarea
                  id="tech-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this visit..."
                  className="mt-1"
                />
              </div>
              <Button onClick={handleCheckOut} className="w-full">
                <LogOut className="mr-2 h-4 w-4" /> Check-out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {activeStopIndex !== null && activeStopIndex < itinerary.length - 1 && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                    Next Stop
                    <ChevronRight />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-semibold text-primary">{itinerary[activeStopIndex + 1].propertyName}</p>
                <p className="text-sm text-muted-foreground">{itinerary[activeStopIndex + 1].address}</p>
            </CardContent>
        </Card>
      )}

      {activeStopIndex !== null && activeStopIndex === itinerary.length - 1 && (
         <Card className="bg-secondary">
            <CardHeader>
                <CardTitle className="text-lg">This is your last stop!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">After checking out, you'll be able to generate your end-of-trip report.</p>
            </CardContent>
        </Card>
      )}

      <EndOfTripDialog isOpen={isEndTripDialogOpen} onOpenChange={setEndTripDialogOpen} />
    </div>
  );
}
