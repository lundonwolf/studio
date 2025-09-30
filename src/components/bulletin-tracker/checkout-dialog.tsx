"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTrip } from "@/hooks/use-trip";
import { useSettings } from "@/hooks/use-settings";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LogOut, Loader2 } from "lucide-react";

const formSchema = z.object({
  status: z.enum(["Successful", "Not Successful"]),
  reason: z.string().min(1, "Please select a reason."),
  notes: z.string().optional(),
});

type CheckOutDialogProps = {
  stopId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function CheckOutDialog({ stopId, isOpen, onOpenChange }: CheckOutDialogProps) {
  const { dispatch: tripDispatch } = useTrip();
  const { state: settingsState } = useSettings();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "Successful",
      reason: "Completed as expected",
      notes: "",
    },
  });

  const successfulReasons = [{ id: 'success-1', text: 'Completed as expected' }];

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    tripDispatch({
      type: "CHECK_OUT",
      payload: { ...values },
    });
    setIsLoading(false);
    onOpenChange(false);
    form.reset();
  }
  
  const status = form.watch("status");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Check-out</DialogTitle>
          <DialogDescription>
            Record the outcome of your visit.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Visit Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Successful" />
                        </FormControl>
                        <FormLabel className="font-normal">Successful</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Not Successful" />
                        </FormControl>
                        <FormLabel className="font-normal">Not Successful</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      { (status === 'Successful' ? successfulReasons : settingsState.reasons).map(reason => (
                        <SelectItem key={reason.id} value={reason.text}>
                          {reason.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tech Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      id="tech-notes"
                      placeholder="Add any notes about this visit..."
                      className="mt-1"
                      {...field}
                    />
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
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Confirm Check-out
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
