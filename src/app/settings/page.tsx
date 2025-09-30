"use client";

import { useState } from 'react';
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, Edit, Save, X, ArrowLeft } from "lucide-react";
import type { CheckoutReason, Stop } from '@/lib/types';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const LocationForm = ({
  stop,
  onSave,
  onCancel,
  onChange,
  isAdding,
}: {
  stop: Partial<Stop>,
  onSave: () => void,
  onCancel: () => void,
  onChange: (stop: Partial<Stop>) => void,
  isAdding?: boolean,
}) => {
  const handleChange = (field: keyof Stop, value: any) => {
    onChange({ ...stop, [field]: value });
  };
  const handleContactChange = (field: keyof Stop['contact'], value: any) => {
    onChange({ ...stop, contact: { ...stop.contact, [field]: value } });
  };
  const handleImageGalleryChange = (value: string) => {
    onChange({ ...stop, imageGallery: value.split(',').map(url => url.trim()) });
  };

  return (
    <div className="p-3 border-dashed border-2 rounded-lg space-y-2">
       <Accordion type="multiple" defaultValue={['location', 'connection', 'contact', 'instructions', 'gallery']} className="w-full">
        <AccordionItem value="location">
          <AccordionTrigger>Location Details</AccordionTrigger>
          <AccordionContent className="space-y-2 px-1">
            <Label>Property Name</Label>
            <Input placeholder="e.g., Downtown Mall" value={stop.propertyName || ''} onChange={e => handleChange('propertyName', e.target.value)} />
            <Label>Address</Label>
            <Input placeholder="e.g., 123 Main St" value={stop.address || ''} onChange={e => handleChange('address', e.target.value)} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="connection">
          <AccordionTrigger>Connection Details</AccordionTrigger>
          <AccordionContent className="space-y-2 px-1">
            <Label>Screen ID</Label>
            <Input placeholder="e.g., DM-ENT-01" value={stop.screenId || ''} onChange={e => handleChange('screenId', e.target.value)} />
            <Label>MAC Address</Label>
            <Input placeholder="e.g., 00:1A:2B:3C:4D:5E" value={stop.macAddress || ''} onChange={e => handleChange('macAddress', e.target.value)} />
            <Label>Wi-Fi SSID</Label>
            <Input placeholder="e.g., MallGuestWiFi" value={stop.wifiSsid || ''} onChange={e => handleChange('wifiSsid', e.target.value)} />
            <Label>Wi-Fi Password</Label>
            <Input placeholder="e.g., supersecret" value={stop.wifiPassword || ''} onChange={e => handleChange('wifiPassword', e.target.value)} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="contact">
          <AccordionTrigger>Contact Details</AccordionTrigger>
          <AccordionContent className="space-y-2 px-1">
            <Label>Contact Name</Label>
            <Input placeholder="e.g., John Doe" value={stop.contact?.name || ''} onChange={e => handleContactChange('name', e.target.value)} />
            <Label>Contact Email</Label>
            <Input placeholder="e.g., john@example.com" value={stop.contact?.email || ''} onChange={e => handleContactChange('email', e.target.value)} />
            <Label>Contact Phone</Label>
            <Input placeholder="e.g., 555-123-4567" value={stop.contact?.phone || ''} onChange={e => handleContactChange('phone', e.target.value)} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="instructions">
          <AccordionTrigger>Tech Instructions</AccordionTrigger>
          <AccordionContent className="px-1">
             <Textarea placeholder="e.g., Screen is by the food court." value={stop.techInstructions || ''} onChange={e => handleChange('techInstructions', e.target.value)} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="gallery">
          <AccordionTrigger>Image Gallery</AccordionTrigger>
          <AccordionContent className="px-1">
            <Textarea placeholder="e.g., https://example.com/image1.jpg, https://example.com/image2.jpg" value={stop.imageGallery?.join(', ') || ''} onChange={e => handleImageGalleryChange(e.target.value)} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex gap-2 pt-4">
        <Button size="sm" onClick={onSave}><Save size={16}/> {isAdding ? 'Add Stop' : 'Save'}</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}><X size={16}/> Cancel</Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { state, dispatch } = useSettings();
  const { stops, reasons, successfulReasons } = state;

  // Locations state
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [newStop, setNewStop] = useState<Partial<Stop>>({
    contact: { name: '', email: '', phone: '' },
    imageGallery: [],
  });
  const [isAddingStop, setIsAddingStop] = useState(false);

  // Reasons state
  const [newReason, setNewReason] = useState("");
  const [newSuccessfulReason, setNewSuccessfulReason] = useState("");

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
      const stopToAdd: Omit<Stop, 'id' | 'coordinates'> = {
        propertyName: newStop.propertyName || '',
        address: newStop.address || '',
        contact: {
            name: newStop.contact?.name || '',
            email: newStop.contact?.email || '',
            phone: newStop.contact?.phone || '',
        },
        screenId: newStop.screenId || '',
        wifiSsid: newStop.wifiSsid || '',
        wifiPassword: newStop.wifiPassword || '',
        macAddress: newStop.macAddress || '',
        techInstructions: newStop.techInstructions || '',
        imageGallery: newStop.imageGallery?.filter(url => url) || [],
      };
    dispatch({ type: 'ADD_STOP', payload: stopToAdd });
    setNewStop({ contact: { name: '', email: '', phone: '' }, imageGallery: [] });
    setIsAddingStop(false);
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

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Manage Locations */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Manage Locations</CardTitle>
            <CardDescription>Add, edit, or remove service stops.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stops.map(stop => (
              <div key={stop.id} className="p-3 bg-secondary/50 rounded-lg space-y-2">
                {editingStop?.id === stop.id ? (
                    <LocationForm 
                        stop={editingStop}
                        onSave={handleSaveStop}
                        onCancel={() => setEditingStop(null)}
                        onChange={(updatedStop) => setEditingStop(updatedStop as Stop)}
                    />
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{stop.propertyName}</p>
                      <p className="text-sm text-muted-foreground">{stop.address}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
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
                <LocationForm 
                    stop={newStop}
                    onSave={handleAddStop}
                    onCancel={() => setIsAddingStop(false)}
                    onChange={setNewStop}
                    isAdding
                />
            ) : (
                <Button onClick={() => setIsAddingStop(true)} className="w-full" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4"/> Add New Location
                </Button>
            )}
          </CardContent>
        </Card>

        {/* Manage Successful Checkout Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Successful Reasons</CardTitle>
            <CardDescription>Customize reasons for "Successful" check-outs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successfulReasons.map(reason => (
              <div key={reason.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <p>{reason.text}</p>
                <Button size="icon" variant="ghost" onClick={() => dispatch({ type: "DELETE_SUCCESSFUL_REASON", payload: reason.id })}>
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            ))}
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
