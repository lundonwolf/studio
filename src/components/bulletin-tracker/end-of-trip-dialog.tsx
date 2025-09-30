"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTrip } from "@/hooks/use-trip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateEndOfTripReport } from "@/ai/flows/generate-end-of-trip-report";

const formSchema = z.object({
  mileage: z.coerce.number().min(0, "Mileage must be a positive number."),
  expenses: z.string().optional(),
  inventoryCheck: z.string().min(1, "Inventory check is required."),
  technicianNotes: z.string().optional(),
});

type EndOfTripDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function EndOfTripDialog({ isOpen, onOpenChange }: EndOfTripDialogProps) {
  const { state, dispatch } = useTrip();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mileage: 0,
      expenses: "",
      inventoryCheck: "",
      technicianNotes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!state.tripStartTime) {
      toast({ title: "Trip start time not found.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
        const totalHoursWorked = (new Date().getTime() - state.tripStartTime.getTime()) / (1000 * 60 * 60);

        const completedStops = state.history.filter(event => event.timeOut).map(event => {
          const stop = state.itinerary.find(s => s.id === event.stopId);
          return {
            propertyName: event.propertyName,
            address: stop?.address || 'N/A',
            timeIn: event.timeIn.toISOString(),
            timeOut: event.timeOut!.toISOString(),
            status: event.status || 'N/A',
            notes: event.notes || 'No notes.',
          }
        });

        const reportInput = {
            ...values,
            totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
            numberOfStops: completedStops.length,
            stops: completedStops,
        };

        const result = await generateEndOfTripReport(reportInput);
        dispatch({ type: "END_TRIP", payload: { report: result.report } });
        toast({
            title: "Trip Ended Successfully!",
            description: "Your end-of-trip report has been generated.",
        });
        onOpenChange(false);
        form.reset();

    } catch (error) {
        console.error("Failed to generate end of trip report:", error);
        toast({
            title: "Report Generation Failed",
            description: "Could not generate the end of trip report. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>End of Trip Report</DialogTitle>
          <DialogDescription>
            Fill in the final details for your trip to generate a summary.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Mileage</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 55" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inventoryCheck"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End of Day Inventory Check</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., All tools accounted for" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expenses (Parking, Tolls, etc.)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Parking at Oakwood: $5.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="technicianNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Notes for Supervisor</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any other details to report..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Report & End Trip
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
