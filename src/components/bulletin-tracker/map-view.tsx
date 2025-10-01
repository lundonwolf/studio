"use client";

import { useEffect } from "react";
import { useTrip } from "@/hooks/use-trip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, LocateFixed, Waypoints } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { haversineDistance } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const GEOFENCE_RADIUS_METERS = 100; // in meters, haversineDistance now returns miles

export function MapView() {
  const { state, dispatch } = useTrip();
  const { currentLocation, activeStopIndex, itinerary, history } = state;
  const { toast } = useToast();

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        dispatch({ type: "SET_CURRENT_LOCATION", payload: { latitude, longitude } });
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [dispatch]);

  useEffect(() => {
    if(state.tripStatus !== 'active' || activeStopIndex === null || !currentLocation) return;
    
    const currentStop = itinerary[activeStopIndex];
    if(!currentStop) return;

    const isCheckedIn = history.some(h => h.stopId === currentStop.id && h.timeOut === null);
    if(isCheckedIn) return;

    const distanceInMiles = haversineDistance(currentLocation, currentStop.coordinates);
    const distanceInMeters = distanceInMiles * 1609.34;

    if (distanceInMeters <= GEOFENCE_RADIUS_METERS) {
      toast({
        title: "You've arrived!",
        description: `You are near ${currentStop.propertyName}. Don't forget to check in.`,
      });
      console.log(`Geofence triggered for ${currentStop.propertyName}`);
    }

  }, [currentLocation, activeStopIndex, itinerary, history, state.tripStatus, toast]);
  
  const mapSrc = currentLocation
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.longitude-0.01},${currentLocation.latitude-0.01},${currentLocation.longitude+0.01},${currentLocation.latitude+0.01}&layer=mapnik&marker=${currentLocation.latitude},${currentLocation.longitude}`
    : null;


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="text-primary" />
          Live Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-[4/3] w-full rounded-lg overflow-hidden relative shadow-md bg-muted">
          {mapSrc ? (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapSrc}
              style={{ border: 'none' }}
              title="Live Map"
            />
          ) : (
             <Skeleton className="h-full w-full" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><LocateFixed size={14} /> Latitude</p>
                <p className="font-mono font-semibold">{currentLocation?.latitude.toFixed(4) ?? "..."}</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Waypoints size={14} /> Longitude</p>
                <p className="font-mono font-semibold">{currentLocation?.longitude.toFixed(4) ?? "..."}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
