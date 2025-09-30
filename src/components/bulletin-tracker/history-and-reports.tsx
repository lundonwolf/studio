"use client";

import { useState } from "react";
import { useTrip } from "@/hooks/use-trip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, FileText, Loader2, CheckCircle, XCircle } from "lucide-react";
import { generateLocationReport } from "@/ai/flows/generate-location-report";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import type { CheckOutStatus } from "@/lib/types";

function formatDuration(start: Date, end: Date | null): string {
  if (!end) return "In Progress";
  const diff = end.getTime() - start.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
}

function StatusIndicator({ status }: { status: CheckOutStatus | undefined }) {
    if (!status) return null;

    if (status === 'Successful') {
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle size={14} className="mr-1"/> Successful</Badge>
    }
    return <Badge variant="destructive"><XCircle size={14} className="mr-1"/> Not Successful</Badge>
}


export function HistoryAndReports() {
  const { state } = useTrip();
  const { history, tripStartTime } = state;
  const { toast } = useToast();
  const [report, setReport] = useState<string | null>(null);
  const [isReportOpen, setReportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    const completedEvents = history.filter(event => event.timeIn && event.timeOut);
    if(completedEvents.length === 0) {
      toast({
        title: "No data to report",
        description: "Complete at least one check-in/check-out cycle to generate a report.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const reportInput = {
        jobName: "Daily Route",
        locations: completedEvents.map(event => ({
          latitude: event.coordinates.latitude,
          longitude: event.coordinates.longitude,
          timeIn: event.timeIn.toISOString(),
          timeOut: event.timeOut!.toISOString(),
        })),
      };
      const result = await generateLocationReport(reportInput);
      setReport(result.report);
      setReportOpen(true);
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast({
        title: "Report Generation Failed",
        description: "Could not generate the location report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="text-primary" />
          Trip History
        </CardTitle>
        <CardDescription>
          A log of your check-ins and check-outs for the current trip.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length > 0 ? (
                history.toReversed().map((event) => (
                  <TableRow key={event.stopId}>
                    <TableCell className="font-medium">
                        <div>{event.propertyName}</div>
                        <div className="text-xs text-muted-foreground">{new Date(event.timeIn).toLocaleTimeString()} - {event.timeOut ? new Date(event.timeOut).toLocaleTimeString() : "..."}</div>
                    </TableCell>
                    <TableCell>{formatDuration(event.timeIn, event.timeOut)}</TableCell>
                    <TableCell><StatusIndicator status={event.status} /></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    {tripStartTime ? "No check-ins yet." : "Trip has not started."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateReport} disabled={history.filter(h => h.timeOut).length === 0 || isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
          Generate Location Report
        </Button>
      </CardFooter>
      <Dialog open={isReportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Location Report</DialogTitle>
            <DialogDescription>
              AI-generated summary of time spent at each location.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] mt-4">
            <pre className="p-4 bg-secondary rounded-md whitespace-pre-wrap text-sm text-secondary-foreground font-sans">
              {report}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
