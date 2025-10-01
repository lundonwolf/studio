"use client";

import { useState } from 'react';
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, ArrowLeft, Download, GripVertical } from "lucide-react";
import type { CheckoutReason, Stop } from '@/lib/types';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export default function SettingsPage() {
  const { state, dispatch } = useSettings();
  const { stops, reasons, successfulReasons } = state;

  // Reasons state
  const [newReason, setNewReason] = useState("");
  const [newSuccessfulReason, setNewSuccessfulReason] = useState("");

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    const itemType = type as 'reasons' | 'successfulReasons';
    dispatch({ type: 'REORDER_ITEMS', payload: { type: itemType, sourceIndex: source.index, destinationIndex: destination.index } });
  };

  // Handlers for Reasons
  const handleAddReason = () => {
    if (newReason.trim()) {
      dispatch({ type: "ADD_REASON", payload: { text: newReason.trim() } });
      setNewReason("");
    }
  };

  const handleAddSuccessfulReason = () => {
    if (newSuccessfulReason.trim()) {
      dispatch({ type: "ADD_SUCCESSFUL_REASON", payload: { text: newSuccessfulReason.trim() } });
      setNewSuccessfulReason("");
    }
  };

   const exportData = (data: any, fileName: string) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = fileName;
    link.click();
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
    <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="outline" size="icon">
                <Link href="/">
                    <ArrowLeft />
                </Link>
            </Button>
            <h1 className="text-3xl font-bold">Settings</h1>
        </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Manage Locations */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Manage Locations</CardTitle>
                    <CardDescription>View service stops. New stops must be added to the code.</CardDescription>
                </div>
                 <Button variant="outline" size="icon" onClick={() => exportData(stops, "bulletin-tracker-locations.json")}>
                    <Download className="h-5 w-5" />
                 </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                {stops.map((stop) => (
                    <div key={stop.id} className="p-3 bg-secondary/50 rounded-lg space-y-2 mb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{stop.propertyName}</p>
                                <p className="text-sm text-muted-foreground">{stop.address}</p>
                                <p className="text-sm text-muted-foreground italic pl-2">↳ {stop.screenLocation}</p>
                            </div>
                        </div>
                    </div>
                ))}
              </div>
          </CardContent>
        </Card>

        {/* Manage Successful Checkout Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Successful Reasons</CardTitle>
            <CardDescription>Customize reasons for "Successful" check-outs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Droppable droppableId="successfulReasons" type="successfulReasons">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                    {successfulReasons.map((reason, index) => (
                        <Draggable key={reason.id} draggableId={reason.id} index={index}>
                        {(provided, snapshot) => (
                            <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between p-3 bg-secondary/50 rounded-lg mb-2 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                     <button {...provided.dragHandleProps} className="p-1"><GripVertical className="h-5 w-5 text-muted-foreground" /></button>
                                    <p>{reason.text}</p>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => dispatch({ type: "DELETE_SUCCESSFUL_REASON", payload: reason.id })}>
                                <Trash2 className="h-5 w-5 text-destructive" />
                                </Button>
                            </div>
                        )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                    </div>
                )}
            </Droppable>
            <div className="flex gap-2">
              <Input
                value={newSuccessfulReason}
                onChange={e => setNewSuccessfulReason(e.target.value)}
                placeholder="Add a new reason"
                onKeyUp={(e) => e.key === 'Enter' && handleAddSuccessfulReason()}
              />
              <Button onClick={handleAddSuccessfulReason}><PlusCircle className="h-5 w-5"/></Button>
            </div>
          </CardContent>
        </Card>

        {/* Manage Not Successful Checkout Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Not Successful Reasons</CardTitle>
            <CardDescription>Customize reasons for "Not Successful" check-outs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Droppable droppableId="reasons" type="reasons">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                    {reasons.map((reason, index) => (
                        <Draggable key={reason.id} draggableId={reason.id} index={index}>
                        {(provided, snapshot) => (
                            <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between p-3 bg-secondary/50 rounded-lg mb-2 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                    <button {...provided.dragHandleProps} className="p-1"><GripVertical className="h-5 w-5 text-muted-foreground" /></button>
                                    <p>{reason.text}</p>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => dispatch({ type: "DELETE_REASON", payload: reason.id })}>
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                </Button>
                            </div>
                        )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                    </div>
                )}
            </Droppable>
            <div className="flex gap-2">
              <Input
                value={newReason}
                onChange={e => setNewReason(e.target.value)}
                placeholder="Add a new reason"
                onKeyUp={(e) => e.key === 'Enter' && handleAddReason()}
              />
              <Button onClick={handleAddReason}><PlusCircle className="h-5 w-5"/></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </DragDropContext>
  );
}
