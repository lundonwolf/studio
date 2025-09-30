import { TripProvider } from "@/contexts/trip-context";
import Dashboard from "@/components/bulletin-tracker/dashboard";

export default function Home() {
  return (
    <TripProvider>
      <Dashboard />
    </TripProvider>
  );
}
