import { TripProvider } from "@/contexts/trip-context";
import Dashboard from "@/components/bulletin-tracker/dashboard";
import { SettingsProvider } from "@/contexts/settings-context";
import OfflinePage from "./_offline/page";
import { AuthProvider } from "@/contexts/auth-context";

export default function Home() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <TripProvider>
          <Dashboard />
          <OfflinePage />
        </TripProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
