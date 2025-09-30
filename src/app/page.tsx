import { TripProvider } from "@/contexts/trip-context";
import Dashboard from "@/components/bulletin-tracker/dashboard";
import { SettingsProvider } from "@/contexts/settings-context";

export default function Home() {
  return (
    <SettingsProvider>
      <TripProvider>
        <Dashboard />
      </TripProvider>
    </SettingsProvider>
  );
}
