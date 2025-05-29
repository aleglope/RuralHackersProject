export type TransportType =
  | "walking"
  | "bicycle"
  | "motorcycle"
  | "car"
  | "van"
  | "bus"
  | "truck"
  | "train"
  | "plane"
  | "other";

export type FuelType =
  | "gasoline"
  | "diesel"
  | "hybrid"
  | "pluginHybrid"
  | "electric"
  | "unknown";

export type UserType =
  | "public"
  | "participant"
  | "logistics"
  | "provider"
  | "staff"
  | "other";

export type VanTruckSize = "<7.5t" | "7.5-12t" | "20-26t" | "34-40t" | "50-60t";

export interface TravelSegment {
  vehicleType?: TransportType;
  fuelType?: FuelType;
  passengers?: number;
  vanSize?: VanTruckSize;
  truckSize?: VanTruckSize;
  carbonCompensated?: boolean;
  startDate?: string;
  endDate?: string;
  distance?: number;
  origin?: string;
  destination?: string;
  returnTrip?: boolean;
  frequency?: number;
  vehicleTypeOtherDetails?: string;
}

export interface TravelData {
  eventName: string;
  userType?: UserType;
  userTypeOtherDetails?: string;
  segments: TravelSegment[];
  hotelNights?: number;
  comments?: string;
}
