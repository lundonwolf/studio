"use client";

import { useTrip } from "@/hooks/use-trip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, MapPin, PlusCircle, Trash2, Play, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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
    </div>
    </DragDropContext>
  );
}
