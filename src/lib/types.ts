export type Contact = {
  name: string;
  email: string;
  phone: string;
};

export type Stop = {
  id: string;
  propertyName: string;
  address: string;
  screenLocation: string;
  contact: Contact;
  screenId: string;
  wifiSsid: string;
  wifiPassword?: string;
  macAddress?: string;
  techInstructions: string;
  imageGallery?: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

export type CheckOutStatus = "Successful" | "Not Successful";

export type CheckInEvent = {
  stopId: string;
  propertyName: string;
  timeIn: Date;
  timeOut: Date | null;
  notes?: string;
  status?: CheckOutStatus;
  reason?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
};

export type TripStatus = "idle" | "planning" | "active" | "ended";

export type CheckoutReason = {
    id: string;
    text: string;
}

export type Coordinates = {
    latitude: number;
    longitude: number;
};
