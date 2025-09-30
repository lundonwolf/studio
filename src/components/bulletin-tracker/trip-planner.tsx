"use client";

import { useTrip } from "@/hooks/use-trip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { List, MapPin, PlusCircle, Trash2, Play } from "lucide-react";

export function TripPlanner() {
  const { state, dispatch } = useTrip();
  const { allStops, itinerary } = state;

  const handleStartTrip = () => {
    if (itinerary.length > 0) {
      dispatch({ type: "START_TRIP" });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="text-primary" />
            Available Stops
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {allStops.map((stop) => (
                <div key={stop.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-semibold">{stop.propertyName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin size={14}/> {stop.address}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => dispatch({ type: "ADD_TO_ITINERARY", payload: stop })}
                    disabled={itinerary.some(i => i.id === stop.id)}
                  >
                    <PlusCircle className="h-5 w-5 text-primary" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="text-primary" />
            Today's Itinerary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {itinerary.length > 0 ? (
              <ol className="space-y-4">
                {itinerary.map((stop, index) => (
                  <li key={stop.id} className="flex items-center gap-4">
                     <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">{index + 1}</span>
                    <div className="flex-grow">
                      <p className="font-semibold">{stop.propertyName}</p>
                      <p className="text-sm text-muted-foreground">{stop.address}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => dispatch({ type: "REMOVE_FROM_ITINERARY", payload: stop.id })}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <p>No stops added to your itinerary yet.</p>
                <p className="text-sm">Add stops from the list on the left.</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartTrip} disabled={itinerary.length === 0} className="w-full">
            <Play className="mr-2 h-4 w-4" /> Start Trip
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
