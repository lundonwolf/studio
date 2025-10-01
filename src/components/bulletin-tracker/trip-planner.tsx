"use client";

import { useState } from "react";
import { useTrip } from "@/hooks/use-trip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, MapPin, PlusCircle, Trash2, Play, GripVertical, Sparkles, Loader2, TrafficCone, BrainCircuit, Zap } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { predictTravelTime, PredictTravelTimeOutput as AIPredictionOutput } from "@/ai/flows/predict-travel-time";
import { predictRealTimeTravelTime, PredictRealTimeTravelTimeOutput as RealTimePredictionOutput } from "@/ai/flows/predict-real-time-travel-time";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

type PredictionOutput = AIPredictionOutput | RealTimePredictionOutput;

function TrafficPredictor() {
    const { state } = useTrip();
    const { itinerary, currentLocation } = state;
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [prediction, setPrediction] = useState<PredictionOutput | null>(null);
    const [departureTime, setDepartureTime] = useState("9:00 AM");
    const [useRealTime, setUseRealTime] = useState(false);


    const handlePrediction = async () => {
        if (!currentLocation && useRealTime) {
            toast({
                title: "Current Location Unknown",
                description: "Cannot make a live prediction without your current location.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setPrediction(null);
        try {
            const firstStop = itinerary[0];
            let result: PredictionOutput;

            if (useRealTime) {
                result = await predictRealTimeTravelTime({
                    startAddress: "My Current Location", // Can be more specific if needed
                    endAddress: firstStop.address,
                });
            } else {
                result = await predictTravelTime({
                    startAddress: "My Current Location",
                    endAddress: firstStop.address,
                    departureTime: departureTime,
                });
            }

            setPrediction(result);

        } catch (error) {
            console.error("Traffic prediction failed", error);
            toast({
                title: "Prediction Failed",
                description: "Could not generate a traffic prediction. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (itinerary.length === 0) {
        return null;
    }

    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrafficCone className="text-primary" />
                        Travel Time Estimator
                    </div>
                    <div className="flex items-center space-x-2">
                        <BrainCircuit size={16} className={!useRealTime ? 'text-primary' : 'text-muted-foreground'}/>
                        <Switch id="prediction-mode" checked={useRealTime} onCheckedChange={setUseRealTime} />
                        <Zap size={16} className={useRealTime ? 'text-primary' : 'text-muted-foreground'}/>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground">
                    Estimate travel time to your first stop (<span className="font-semibold">{itinerary[0].propertyName}</span>). 
                    Use AI for a general estimate or Live Traffic for real-time data.
                </p>
                {!useRealTime && (
                    <div className="space-y-2">
                        <Label htmlFor="departure-time">Departure Time</Label>
                        <Input 
                            id="departure-time" 
                            type="time" 
                            value={departureTime}
                            onChange={(e) => setDepartureTime(e.target.value)}
                        />
                    </div>
                )}
                <Button onClick={handlePrediction} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    {useRealTime ? "Get Live Travel Time" : "Get AI Estimate"}
                </Button>
                {prediction && (
                    <div className="p-4 bg-secondary rounded-lg space-y-2 mt-4">
                        <h4 className="font-semibold">Prediction Result:</h4>
                        <div className="flex justify-around text-center">
                            <div>
                                <p className="text-2xl font-bold">{prediction.estimatedDuration}</p>
                                <p className="text-sm text-muted-foreground">minutes</p>
                            </div>
                             <div>
                                <p className="text-2xl font-bold">{prediction.distance}</p>
                                <p className="text-sm text-muted-foreground">distance</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground pt-2 text-center">{prediction.trafficSummary}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function TripPlanner() {
  const { state, dispatch } = useTrip();
  const { allStops, itinerary } = state;

  const handleStartTrip = () => {
    if (itinerary.length > 0) {
      dispatch({ type: "START_TRIP" });
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    
    if (result.source.droppableId === 'itinerary' && result.destination.droppableId === 'itinerary') {
        dispatch({ type: 'REORDER_ITINERARY', payload: { sourceIndex: result.source.index, destinationIndex: result.destination.index } });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
            <Droppable droppableId="itinerary">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {itinerary.length > 0 ? (
                            itinerary.map((stop, index) => (
                                <Draggable key={stop.id} draggableId={stop.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`flex items-center gap-4 p-2 rounded-lg bg-secondary/80 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                        >
                                            <button {...provided.dragHandleProps} className="p-1"><GripVertical className="h-5 w-5 text-muted-foreground" /></button>
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
                                        </div>
                                    )}
                                </Draggable>
                            ))
                        ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                            <p>No stops added to your itinerary yet.</p>
                            <p className="text-sm">Add stops from the list on the left.</p>
                        </div>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartTrip} disabled={itinerary.length === 0} className="w-full">
            <Play className="mr-2 h-4 w-4" /> Start Trip
          </Button>
        </CardFooter>
      </Card>

      <TrafficPredictor />
    </div>
    </DragDropContext>
  );
}
