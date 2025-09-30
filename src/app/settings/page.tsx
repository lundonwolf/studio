"use client";

import { useState } from 'react';
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, Edit, Save, X, ArrowLeft } from "lucide-react";
import type { Stop } from '@/lib/types';
import Link from 'next/link';

export default function SettingsPage() {
  const { state, dispatch } = useSettings();
  const { stops, reasons } = state;

  // Locations state
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [newStop, setNewStop] = useState<Partial<Stop>>({});
  const [isAddingStop, setIsAddingStop] = useState(false);

  // Reasons state
  const [newReason, setNewReason] = useState("");

  // Handlers for Locations
  const handleEditStop = (stop: Stop) => {
    setEditingStop({ ...stop });
  };

  const handleSaveStop = () => {
    if (editingStop) {
      dispatch({ type: "UPDATE_STOP", payload: editingStop });
      setEditingStop(null);
    }
  };

  const handleAddStop = () => {
      const stopToAdd = {
        propertyName: newStop.propertyName || '',
        address: newStop.address || '',
        contact: {
            name: newStop.contact?.name || '',
            email: newStop.contact?.email || '',
            phone: newStop.contact?.phone || '',
        },
        screenId: newStop.screenId || '',
        wifiSsid: newStop.wifiSsid || '',
        techInstructions: newStop.techInstructions || '',
      };
    dispatch({ type: 'ADD_STOP', payload: stopToAdd });
    setNewStop({});
    setIsAddingStop(false);
  };

  // Handlers for Reasons
  const handleAddReason = () => {
    if (newReason.trim()) {
      dispatch({ type: "ADD_REASON", payload: { text: newReason.trim() } });
      setNewReason("");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="outline" size="icon">
                <Link href="/">
                    <ArrowLeft />
                </Link>
            </Button>
            <h1 className="text-3xl font-bold">Settings</h1>
        </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Manage Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Locations</CardTitle>
            <CardDescription>Add, edit, or remove service stops.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stops.map(stop => (
              <div key={stop.id} className="p-3 bg-secondary/50 rounded-lg space-y-2">
                {editingStop?.id === stop.id ? (
                  <div className="space-y-2">
                    <Label>Property Name</Label>
                    <Input value={editingStop.propertyName} onChange={e => setEditingStop({...editingStop, propertyName: e.target.value})} />
                    <Label>Address</Label>
                    <Input value={editingStop.address} onChange={e => setEditingStop({...editingStop, address: e.target.value})} />
                     <Label>Screen ID</Label>
                    <Input value={editingStop.screenId} onChange={e => setEditingStop({...editingStop, screenId: e.target.value})} />
                    {/* Add other fields as needed */}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveStop}><Save size={16}/> Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingStop(null)}><X size={16}/> Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{stop.propertyName}</p>
                      <p className="text-sm text-muted-foreground">{stop.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEditStop(stop)}><Edit className="h-5 w-5"/></Button>
                      <Button size="icon" variant="ghost" onClick={() => dispatch({ type: "DELETE_STOP", payload: stop.id })}>
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isAddingStop ? (
                <div className="p-3 border-dashed border-2 rounded-lg space-y-2">
                    <Label>Property Name</Label>
                    <Input placeholder="e.g., Downtown Mall" value={newStop.propertyName || ''} onChange={e => setNewStop({...newStop, propertyName: e.target.value})} />
                    <Label>Address</Label>
                    <Input placeholder="e.g., 123 Main St" value={newStop.address || ''} onChange={e => setNewStop({...newStop, address: e.target.value})} />
                    <Label>Screen ID</Label>
                    <Input placeholder="e.g., DM-ENT-01" value={newStop.screenId || ''} onChange={e => setNewStop({...newStop, screenId: e.target.value})} />
                     <Label>Wi-Fi SSID</Label>
                    <Input placeholder="e.g., MallGuestWiFi" value={newStop.wifiSsid || ''} onChange={e => setNewStop({...newStop, wifiSsid: e.target.value})} />
                     <Label>Tech Instructions</Label>
                    <Input placeholder="e.g., Screen is by the food court." value={newStop.techInstructions || ''} onChange={e => setNewStop({...newStop, techInstructions: e.target.value})} />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddStop}><Save size={16}/> Add Stop</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsAddingStop(false)}><X size={16}/> Cancel</Button>
                    </div>
                </div>
            ) : (
                <Button onClick={() => setIsAddingStop(true)} className="w-full" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4"/> Add New Location
                </Button>
            )}
          </CardContent>
        </Card>

        {/* Manage Checkout Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Checkout Reasons</CardTitle>
            <CardDescription>Customize reasons for "Not Successful" check-outs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reasons.map(reason => (
              <div key={reason.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <p>{reason.text}</p>
                <Button size="icon" variant="ghost" onClick={() => dispatch({ type: "DELETE_REASON", payload: reason.id })}>
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            ))}
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
  );
}
