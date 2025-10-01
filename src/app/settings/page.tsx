"use client";

import { useState } from 'react';
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, ArrowLeft, Download, GripVertical, Edit, Save, X } from "lucide-react";
import type { CheckoutReason, Stop } from '@/lib/types';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const initialStopFormState = {
    propertyName: "",
    address: "",
    screenLocation: "",
    contact: { name: "", email: "", phone: "" },
    screenId: "",
    wifiSsid: "",
    wifiPassword: "",
    macAddress: "",
    techInstructions: "",
};

export default function SettingsPage() {
  const { state, dispatch } = useSettings();
  const { stops, reasons, successfulReasons } = state;

  // Stop state
  const [isAdding, setIsAdding] = useState(false);
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [stopFormState, setStopFormState] = useState<Omit<Stop, 'id' | 'imageGallery' | 'coordinates'>>(initialStopFormState);

  // Reasons state
  const [newReason, setNewReason] = useState("");
  const [newSuccessfulReason, setNewSuccessfulReason] = useState("");
  
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }
    
    const itemType = type as 'stops' | 'reasons' | 'successfulReasons';
    dispatch({ type: 'REORDER_ITEMS', payload: { type: itemType, sourceIndex: source.index, destinationIndex: destination.index } });
  };
  
  // Handlers for Stops
  const handleAddStop = () => {
    dispatch({ type: "ADD_STOP", payload: stopFormState });
    setStopFormState(initialStopFormState);
    setIsAdding(false);
  };
  
  const handleUpdateStop = (id: string) => {
    dispatch({ type: "UPDATE_STOP", payload: { id, ...stopFormState } });
    setEditingStopId(null);
    setStopFormState(initialStopFormState);
  };

  const handleEditClick = (stop: Stop) => {
    setEditingStopId(stop.id);
    const { id, imageGallery, coordinates, ...editableStop } = stop;
    setStopFormState(editableStop);
  };

  const handleCancelEdit = () => {
    setEditingStopId(null);
    setIsAdding(false);
    setStopFormState(initialStopFormState);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("contact.")) {
        const field = name.split('.')[1];
        setStopFormState(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
    } else {
        setStopFormState(prev => ({ ...prev, [name]: value }));
    }
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

  const renderStopForm = (isEditing: boolean) => (
    <Card className="col-span-full">
        <CardHeader>
            <CardTitle>{isEditing ? 'Edit Stop' : 'Add New Stop'}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(stopFormState).map(key => {
                const fieldKey = key as keyof Omit<Stop, 'id' | 'imageGallery' | 'coordinates'>;
                if (typeof stopFormState[fieldKey] === 'object') {
                    if (fieldKey === 'contact') {
                        return Object.keys(stopFormState.contact).map(contactKey => (
                            <div className="space-y-2" key={`contact-${contactKey}`}>
                                <Label htmlFor={`contact.${contactKey}`}>Contact {contactKey}</Label>
                                <Input id={`contact.${contactKey}`} name={`contact.${contactKey}`} value={stopFormState.contact[contactKey as keyof typeof stopFormState.contact]} onChange={handleFormChange} />
                            </div>
                        ));
                    }
                    return null;
                }
                return (
                    <div className="space-y-2" key={fieldKey}>
                        <Label htmlFor={fieldKey}>{fieldKey.split(/(?=[A-Z])/).join(" ")}</Label>
                        <Input id={fieldKey} name={fieldKey} value={stopFormState[fieldKey]} onChange={handleFormChange} />
                    </div>
                );
            })}
        </CardContent>
        <CardContent>
            <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={handleCancelEdit}><X className="h-5 w-5 mr-2"/>Cancel</Button>
                <Button onClick={() => isEditing ? handleUpdateStop(editingStopId!) : handleAddStop()}><Save className="h-5 w-5 mr-2"/>{isEditing ? 'Save Changes' : 'Add Stop'}</Button>
            </div>
        </CardContent>
    </Card>
  );

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
        
        {isAdding && renderStopForm(false)}
        {editingStopId && !isAdding && renderStopForm(true)}
        
        {/* Manage Locations */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Manage Locations</CardTitle>
                    <CardDescription>Add, edit, and reorder service stops.</CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    <Button onClick={() => setIsAdding(true)}><PlusCircle className="h-5 w-5"/></Button>
                    <Button variant="outline" size="icon" onClick={() => exportData(stops, "bulletin-tracker-locations.json")}>
                        <Download className="h-5 w-5" />
                    </Button>
                 </div>
            </div>
          </CardHeader>
          <CardContent>
             <Droppable droppableId="stops" type="stops">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {stops.map((stop, index) => (
                        <Draggable key={stop.id} draggableId={stop.id} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} className={`p-3 bg-secondary/50 rounded-lg ${snapshot.isDragging ? 'shadow-lg' : ''}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <button {...provided.dragHandleProps} className="p-1"><GripVertical className="h-5 w-5 text-muted-foreground" /></button>
                                    <div>
                                        <p className="font-semibold">{stop.propertyName}</p>
                                        <p className="text-sm text-muted-foreground">{stop.address}</p>
                                        <p className="text-sm text-muted-foreground italic pl-2">↳ {stop.screenLocation}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => handleEditClick(stop)}><Edit className="h-5 w-5"/></Button>
                                    <Button size="icon" variant="ghost" onClick={() => dispatch({ type: "DELETE_STOP", payload: stop.id })}><Trash2 className="h-5 w-5 text-destructive"/></Button>
                                </div>
                            </div>
                           </div>
                        )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
            </Droppable>
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
