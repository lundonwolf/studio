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
  const [mapUrl, setMapUrl] = useState<string | null>(null);

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
    if(!currentStop || !currentStop.coordinates) return;

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

  useEffect(() => {
    const itineraryStopsWithCoords = itinerary.map(stop => stop.coordinates).filter(Boolean) as {latitude: number, longitude: number}[];
    const allPoints = [...itineraryStopsWithCoords, ...(currentLocation ? [currentLocation] : [])];
    
    // Don't render a map if there's no itinerary and no current location
    if (allPoints.length === 0) {
      setMapUrl(null);
      return;
    }

    let markers = itinerary.map((stop, index) => {
        if (!stop.coordinates) return null;
        const label = index + 1;
        return `pin-l-marker+0074D9(${stop.coordinates.longitude},${stop.coordinates.latitude})`
    }).filter(Boolean).join(',');
    
    if (currentLocation) {
        const userMarker = `pin-s-star+F54748(${currentLocation.longitude},${currentLocation.latitude})`;
        markers = [markers, userMarker].filter(Boolean).join(',');
    }
    
    let bbox;
    if (allPoints.length > 1) {
        const lats = allPoints.map(p => p.latitude);
        const lons = allPoints.map(p => p.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const buffer = Math.max(Math.abs(maxLat - minLat), Math.abs(maxLon - minLon)) * 0.1 || 0.01;
        bbox = `${minLon - buffer},${minLat - buffer},${maxLon + buffer},${maxLat + buffer}`;
    } else if (allPoints.length === 1) {
        const center = allPoints[0];
        const buffer = 0.01;
        bbox = `${center.longitude - buffer},${center.latitude - buffer},${center.longitude + buffer},${center.latitude + buffer}`;
    }

    if (bbox) {
        const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
        
        // The embed map from openstreetmap has some limitations with markers.
        // A single marker can be added with `&marker=lat,lon`.
        // For multiple markers, we're better off just showing the bounding box.
        // The directions link will show all markers.
        if (allPoints.length === 1 && currentLocation) {
             setMapUrl(`${url}&marker=${currentLocation.latitude},${currentLocation.longitude}`);
        } else if (allPoints.length === 1 && itineraryStopsWithCoords.length === 1) {
             const stopCoord = itineraryStopsWithCoords[0];
             setMapUrl(`${url}&marker=${stopCoord.latitude},${stopCoord.longitude}`);
        }
        else {
             setMapUrl(url);
        }
    }

  }, [itinerary, currentLocation]);
  
  const getDirectionsUrl = () => {
    if (itinerary.length === 0) return null;

    let url = "https://www.google.com/maps/dir/";
    const waypoints = itinerary.map(stop => encodeURIComponent(stop.address));
    url += waypoints.join('/');
    return url;
  }

  const directionsUrl = getDirectionsUrl();


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
          ) : mapUrl ? (
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapUrl}
              style={{ border: 'none' }}
              title="Live Map"
            />
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <p>Add stops to your itinerary to see them on the map.</p>
             </div>
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
