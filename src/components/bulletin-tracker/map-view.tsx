"use client";

import { useEffect, useState } from "react";
import { useTrip } from "@/hooks/use-trip";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Compass, LocateFixed, Waypoints, AlertTriangle, Route } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { haversineDistance } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";

const GEOFENCE_RADIUS_METERS = 100; // in meters, haversineDistance now returns miles

export function MapView() {
  const { state, dispatch } = useTrip();
  const { currentLocation, activeStopIndex, itinerary, history } = state;
  const { toast } = useToast();
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      const errorMsg = "Geolocation is not supported by this browser.";
      console.error(errorMsg);
      setLocationError(errorMsg);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if(locationError) setLocationError(null);
        const { latitude, longitude } = position.coords;
        dispatch({ type: "SET_CURRENT_LOCATION", payload: { latitude, longitude } });
      },
      (error) => {
        let errorMsg = "An unknown error occurred while getting your location.";
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errorMsg = "Location access denied. Please enable it in your browser settings.";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMsg = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                errorMsg = "The request to get user location timed out.";
                break;
        }
        console.error("Error getting location:", errorMsg);
        setLocationError(errorMsg);
        toast({
            variant: 'destructive',
            title: "Location Error",
            description: errorMsg,
        });
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, toast]);

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
  
  const getMapAndDirections = () => {
    const allPoints = [...itinerary.map(s => s.coordinates), ...(currentLocation ? [currentLocation] : [])];
    if (allPoints.length === 0) {
      return { mapSrc: null, directionsUrl: null, bbox: null };
    }

    const lats = allPoints.map(p => p.latitude);
    const lons = allPoints.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    const bbox = `${minLon-0.01},${minLat-0.01},${maxLon+0.01},${maxLat+0.01}`;

    const stopMarkers = itinerary.map(stop => `pin-s-circle+0074D9(${stop.coordinates.longitude},${stop.coordinates.latitude})`).join(',');
    const userMarker = currentLocation ? `pin-s-star+F54748(${currentLocation.longitude},${currentLocation.latitude})` : '';
    const markers = [stopMarkers, userMarker].filter(Boolean).join(',');

    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${currentLocation ? `${currentLocation.latitude},${currentLocation.longitude}`: ''}`;

    let directionsUrl = null;
    if (itinerary.length > 0) {
        directionsUrl = "https://www.google.com/maps/dir/";
        const waypoints = itinerary.map(stop => `${stop.coordinates.latitude},${stop.coordinates.longitude}`);
        directionsUrl += waypoints.join('/');
    }

    return { mapSrc, directionsUrl, bbox };
  }

  const { mapSrc, directionsUrl, bbox } = getMapAndDirections();


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
          {locationError ? (
             <div className="flex flex-col items-center justify-center h-full text-center text-destructive p-4">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p className="font-semibold">Could not get location</p>
                <p className="text-sm">{locationError}</p>
             </div>
          ) : mapSrc ? (
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
       {directionsUrl && (
        <CardFooter>
          <Button
            asChild
            className="w-full"
            disabled={itinerary.length === 0}
          >
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Route className="mr-2 h-4 w-4" /> Get Directions
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
