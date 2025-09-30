export type Contact = {
  name: string;
  email: string;
  phone: string;
};

export type Stop = {
  id: string;
  propertyName: string;
  address: string;
  contact: Contact;
  screenId: string;
  wifiSsid: string;
  wifiPassword?: string;
  techInstructions: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

export type CheckInEvent = {
  stopId: string;
  propertyName: string;
  timeIn: Date;
  timeOut: Date | null;
  notes?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

export type TripStatus = "idle" | "planning" | "active" | "ended";
