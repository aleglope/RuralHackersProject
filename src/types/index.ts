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
  | "event_staff_accredited"
  | "internal_staff_organization"
  | "transport_services_stakeholders"
  | "provider"
  | "logistics"
  | "staff"
  | "other";

export type AccreditedRole =
  | "loc"
  | "vip"
  | "timing"
  | "photo"
  | "media"
  | "tv_production"
  | "sports_delegations"
  | "other_accredited_role";

export type TransportServiceType =
  | "spectator_shuttle_bus"
  | "team_transport_services";

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
  frequency?: number;
  vehicleTypeOtherDetails?: string;
  numberOfVehicles?: number;
}

export interface TravelData {
  eventName: string;
  userType?: UserType;
  userTypeOtherDetails?: string;
  accreditedRole?: AccreditedRole;
  accreditedRoleOtherDetails?: string;
  organizationStaffDetails?: string;
  transportServiceType?: TransportServiceType;
  segments: TravelSegment[];
  hotelNights?: number;
  comments?: string;
}
