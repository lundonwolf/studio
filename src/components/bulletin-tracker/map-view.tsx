"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useTrip } from "@/hooks/use-trip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Compass, LocateFixed, Waypoints } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GEOFENCE_RADIUS_METERS = 100;

function haversineDistance(coords1, coords2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  const R = 6371e3; // metres
  const φ1 = toRad(coords1.latitude);
  const φ2 = toRad(coords2.latitude);
  const Δφ = toRad(coords2.latitude - coords1.latitude);
  const Δλ = toRad(coords2.longitude - coords1.longitude);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}


export function MapView() {
  const { state, dispatch } = useTrip();
  const { currentLocation, activeStopIndex, itinerary, history } = state;
  const { toast } = useToast();
  const mapPlaceholder = PlaceHolderImages.find(img => img.id === 'map-placeholder');

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
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [dispatch]);

  useEffect(() => {
    if(state.tripStatus !== 'active' || activeStopIndex === null || !currentLocation) return;
    
    const currentStop = itinerary[activeStopIndex];
    if(!currentStop) return;

    const isCheckedIn = history.some(h => h.stopId === currentStop.id && h.timeOut === null);
    if(isCheckedIn) return;

    const distance = haversineDistance(currentLocation, currentStop.coordinates);

    if (distance <= GEOFENCE_RADIUS_METERS) {
      toast({
        title: "You've arrived!",
        description: `You are near ${currentStop.propertyName}. Don't forget to check in.`,
      });
      console.log(`Geofence triggered for ${currentStop.propertyName}`);
    }

  }, [currentLocation, activeStopIndex, itinerary, history, state.tripStatus, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="text-primary" />
          Live Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mapPlaceholder && (
          <div className="aspect-[4/3] w-full rounded-lg overflow-hidden relative shadow-md">
            <Image
              src={mapPlaceholder.imageUrl}
              alt={mapPlaceholder.description}
              fill
              style={{ objectFit: 'cover' }}
              data-ai-hint={mapPlaceholder.imageHint}
            />
          </div>
        )}
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
