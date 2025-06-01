import {
  UserType,
  TransportType,
  FuelType,
  VanTruckSize,
  AccreditedRole,
  TransportServiceType,
} from "../types";

// ============= USER TYPES =============
export const ALL_USER_TYPES: UserType[] = [
  "public",
  "participant",
  "event_staff_accredited",
  "internal_staff_organization",
  "transport_services_stakeholders",
  "provider",
  "logistics",
  "staff",
  "other",
];

// Tipos visibles en el formulario (para ocultar/mostrar fácilmente)
export const VISIBLE_USER_TYPES: UserType[] = [
  "public",
  // "participant", // Temporalmente oculto - puede reactivarse eliminando este comentario
  "event_staff_accredited",
  "internal_staff_organization",
  "transport_services_stakeholders",
  "provider",
  // "logistics", // Temporalmente oculto - puede reactivarse eliminando este comentario
  // "staff", // Temporalmente oculto - puede reactivarse eliminando este comentario
  "other",
];

// ============= TRANSPORT TYPES =============
export const ALL_TRANSPORT_TYPES: TransportType[] = [
  "walking",
  "bicycle",
  "motorcycle",
  "car",
  "van",
  "bus",
  "truck",
  "train",
  "plane",
  "other",
];

// ============= FUEL TYPES =============
export const ALL_FUEL_TYPES: FuelType[] = [
  "gasoline",
  "diesel",
  "hybrid",
  "pluginHybrid",
  "electric",
  "unknown",
];

// ============= VAN/TRUCK SIZES =============
export const ALL_VAN_TRUCK_SIZES: VanTruckSize[] = [
  "<7.5t",
  "7.5-12t",
  "20-26t",
  "34-40t",
  "50-60t",
];

// Tamaños específicos para furgonetas (solo los primeros 2)
export const VAN_SIZES: VanTruckSize[] = ALL_VAN_TRUCK_SIZES.slice(0, 2);

// Tamaños para camiones (todos)
export const TRUCK_SIZES: VanTruckSize[] = ALL_VAN_TRUCK_SIZES;

// ============= ACCREDITED ROLES =============
export const ALL_ACCREDITED_ROLES: AccreditedRole[] = [
  "loc",
  "vip",
  "timing",
  "photo",
  "media",
  "tv_production",
  "sports_delegations",
  "other_accredited_role",
];

// ============= TRANSPORT SERVICE TYPES =============
export const ALL_TRANSPORT_SERVICE_TYPES: TransportServiceType[] = [
  "spectator_shuttle_bus",
  "team_transport_services",
];

// ============= CONDITIONAL LOGIC =============
// Vehículos que requieren tipo de combustible
export const FUEL_REQUIRED_VEHICLES: TransportType[] = [
  "car",
  "van",
  "motorcycle",
  "truck",
  "bus",
];

// Vehículos que pueden tener compensación de carbono
export const CARBON_COMPENSATION_VEHICLES: TransportType[] = [
  "plane",
  "train",
  "bus",
];

// Vehículos que pueden tener múltiples unidades
export const MULTIPLE_VEHICLES_TYPES: TransportType[] = [
  "car",
  "motorcycle",
  "van",
  "truck",
  "bus",
];

// ============= ACCOMMODATION LOGIC =============
// Tipos de usuario que requieren información de alojamiento
export const ACCOMMODATION_REQUIRED_USER_TYPES: UserType[] = [
  "public",
  "event_staff_accredited",
];
