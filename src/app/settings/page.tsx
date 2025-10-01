
"use client";

import { useState, useRef, useEffect } from 'react';
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, ArrowLeft, Download, GripVertical, Edit, Save, X, Loader2, Upload, Home } from "lucide-react";
import type { CheckoutReason, Stop } from '@/lib/types';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { state, dispatch } = useSettings();
  const { stops, reasons, successfulReasons, homeAddress } = state;
  const { toast } = useToast();
  const importInputRef = useRef<HTMLInputElement>(null);

  // Home Address State
  const [editingHomeAddress, setEditingHomeAddress] = useState(false);
  const [homeAddressForm, setHomeAddressForm] = useState(homeAddress);

  // Reasons state
  const [newReason, setNewReason] = useState("");
  const [newSuccessfulReason, setNewSuccessfulReason] = useState("");

  useEffect(() => {
    setHomeAddressForm(homeAddress);
  }, [homeAddress]);
  
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }
    
    const itemType = type as 'stops' | 'reasons' | 'successfulReasons';
    dispatch({ type: 'REORDER_ITEMS', payload: { type: itemType, sourceIndex: source.index, destinationIndex: destination.index } });
  };
  
  // Handlers for Home Address
  const handleUpdateHomeAddress = () => {
    dispatch({ type: 'UPDATE_HOME_ADDRESS', payload: homeAddressForm });
    setEditingHomeAddress(false);
    toast({ title: 'Home address updated!' });
  }

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

   const handleExport = () => {
    const settingsData = {
        stops,
        reasons,
        successfulReasons,
        homeAddress,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(settingsData, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "bulletin-tracker-settings.json";
    link.click();
     toast({ title: "Settings Exported", description: "Your settings have been saved to a file." });
  };
  
   const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                throw new Error("File is not readable.");
            }
            const importedState = JSON.parse(text);
            
            // Basic validation
            if (importedState) {
                 dispatch({ type: 'HYDRATE_STATE', payload: importedState });
                 toast({ title: "Settings Imported", description: "Your settings have been successfully loaded." });
            } else {
                 toast({ title: "Import Failed", description: "The selected file does not have a valid format.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Failed to parse imported file:", error);
            toast({ title: "Import Failed", description: "The selected file is not valid JSON.", variant: "destructive" });
        } finally {
            // Reset input value to allow re-importing the same file
            if(importInputRef.current) {
                importInputRef.current.value = "";
            }
        }
    };
    reader.readAsText(file);
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
        
        <Card className="md:col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>Manage application-wide configurations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <Label htmlFor="homeAddress" className="flex items-center gap-2 font-semibold"><Home size={16}/> Home Address</Label>
                            {editingHomeAddress ? (
                                <Input 
                                    id="homeAddress" 
                                    value={homeAddressForm}
                                    onChange={(e) => setHomeAddressForm(e.target.value)}
                                    className="mt-2"
                                />
                            ) : (
                                <p className="text-muted-foreground mt-2">{homeAddress}</p>
                            )}
                        </div>
                        {editingHomeAddress ? (
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost" onClick={() => { setEditingHomeAddress(false); setHomeAddressForm(homeAddress); }}><X className="h-5 w-5"/></Button>
                                <Button size="icon" variant="default" onClick={handleUpdateHomeAddress}><Save className="h-5 w-5"/></Button>
                            </div>
                        ) : (
                            <Button size="icon" variant="ghost" onClick={() => setEditingHomeAddress(true)}><Edit className="h-5 w-5"/></Button>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Import & Export Data</h4>
                    <p className="text-sm text-muted-foreground mb-4">Save your settings to a file or load settings from a backup.</p>
                    <div className="flex gap-4">
                        <input type="file" ref={importInputRef} onChange={handleImport} accept="application/json" className="hidden" />
                        <Button onClick={() => importInputRef.current?.click()} variant="outline"><Upload className="mr-2 h-5 w-5"/> Import</Button>
                        <Button onClick={handleExport}><Download className="mr-2 h-5 w-5"/> Export</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Manage Locations</CardTitle>
                    <CardDescription>View predefined service stops. Adding new stops is not supported in this version.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                {stops.map((stop) => (
                    <div key={stop.id} className="p-3 bg-secondary/50 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className="p-1"><GripVertical className="h-5 w-5 text-muted-foreground" /></div>
                                <div>
                                    <p className="font-semibold">{stop.propertyName}</p>
                                    <p className="text-sm text-muted-foreground">{stop.address}</p>
                                    <p className="text-sm text-muted-foreground italic pl-2">↳ {stop.screenLocation}</p>
                                </div>
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
