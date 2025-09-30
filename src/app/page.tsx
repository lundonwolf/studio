import { TripProvider } from "@/contexts/trip-context";
import Dashboard from "@/components/bulletin-tracker/dashboard";
import { SettingsProvider } from "@/contexts/settings-context";
import OfflinePage from "./_offline/page";

export default function Home() {
  return (
    <SettingsProvider>
      <TripProvider>
        <Dashboard />
        <OfflinePage />
      </TripProvider>
    </SettingsProvider>
  );
}
