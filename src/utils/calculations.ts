import { FuelType, TravelSegment } from "../types";

// CO2e emissions factors (kg CO2e per km)
// For car/van, factors are per vehicle-km.
// For bus/train/plane, factors are per passenger-km.
const EMISSIONS_FACTORS = {
  walking: 0,
  bicycle: 0,
  motorcycle: 0.103, // per vehicle-km
  car: {
    gasoline: 0.192,
    diesel: 0.171,
    hybrid: 0.111,
    pluginHybrid: 0.092,
    electric: 0.053,
    // unknown: 0, // Or a default/average if preferred
  } as Record<Exclude<FuelType, "unknown" | "other">, number>, // Type assertion
  van: {
    gasoline: 0.297,
    diesel: 0.265,
    hybrid: 0.172,
    pluginHybrid: 0.142,
    electric: 0.082,
    // unknown: 0, // Or a default/average if preferred
  } as Record<Exclude<FuelType, "unknown" | "other">, number>, // Type assertion
  bus: 0.027, // per passenger-km
  truck: {
    "<7.5t": 0.459,
    "7.5-12t": 0.563,
    "20-26t": 0.679,
    "34-40t": 0.855,
    "50-60t": 0.932,
  }, // per vehicle-km
  train: 0.041, // per passenger-km
  plane: 0.255, // per passenger-km
  other: 0.2, // default value, assumed per vehicle-km
};

const HOTEL_EMISSIONS = 12; // kg CO2e per night

export const calculateSegmentCarbonFootprint = (
  segment: TravelSegment
): number => {
  const distance = segment.distance || 0;
  const frequency = segment.frequency || 1;
  const passengers = segment.passengers || 1;
  const numberOfVehicles = segment.numberOfVehicles || 1;
  let emissionsPerTripPerVehicleOrPassenger = 0;

  switch (segment.vehicleType) {
    case "car":
    case "van":
      if (segment.fuelType && segment.fuelType !== "unknown") {
        // segment.fuelType is now narrowed to Exclude<FuelType, "unknown">
        const vehicleFactors = EMISSIONS_FACTORS[segment.vehicleType];
        const factor =
          vehicleFactors[segment.fuelType as Exclude<FuelType, "unknown">];
        if (factor !== undefined) {
          emissionsPerTripPerVehicleOrPassenger = factor * distance; // Total for the vehicle
          if (passengers > 1) {
            emissionsPerTripPerVehicleOrPassenger /= passengers; // Per person in that vehicle
          }
        }
      }
      // If fuelType is unknown or 'other', emissions for this part remain 0
      break;
    case "bus":
    case "train":
    case "plane":
      // Factors are per passenger-km
      emissionsPerTripPerVehicleOrPassenger =
        EMISSIONS_FACTORS[segment.vehicleType] * distance * passengers;
      if (segment.carbonCompensated) {
        emissionsPerTripPerVehicleOrPassenger *= 0.5;
      }
      break;
    case "truck":
      if (segment.truckSize) {
        // Ensure truckSize is a valid key
        const truckFactor =
          EMISSIONS_FACTORS.truck[
            segment.truckSize as keyof typeof EMISSIONS_FACTORS.truck
          ];
        if (truckFactor !== undefined) {
          emissionsPerTripPerVehicleOrPassenger = truckFactor * distance;
        }
      }
      break;
    case "motorcycle":
      emissionsPerTripPerVehicleOrPassenger =
        EMISSIONS_FACTORS.motorcycle * distance; // Total for the motorcycle
      const effectiveMotorcyclePassengers = passengers === 1 ? 2 : passengers;
      if (effectiveMotorcyclePassengers > 0) {
        // Should always be true given passengers >= 1
        emissionsPerTripPerVehicleOrPassenger /= effectiveMotorcyclePassengers; // Per person on that motorcycle
      }
      break;
    case "walking":
    case "bicycle":
      emissionsPerTripPerVehicleOrPassenger = 0; // EMISSIONS_FACTORS.walking or .bicycle
      break;
    case "other":
    default: // Fallback for any new types not explicitly handled
      emissionsPerTripPerVehicleOrPassenger =
        EMISSIONS_FACTORS.other * distance;
      // Optional: if 'other' type vehicle can be shared, consider dividing by passengers
      // if (passengers > 1) { emissionsPerTripPerVehicleOrPassenger /= passengers; }
      break;
  }

  // emissionsPerTripPerVehicleOrPassenger is now the emission for one trip,
  // either for one vehicle (truck, other, or car/van/motorcycle before passenger division)
  // or per passenger (bus, train, plane, or car/van/motorcycle after passenger division).
  // This value now correctly represents the emission "unit" to be multiplied.
  return emissionsPerTripPerVehicleOrPassenger * numberOfVehicles * frequency;
};

export const calculateCarbonFootprint = (data: {
  segments: TravelSegment[];
  hotelNights?: number;
}): number => {
  let totalEmissions = 0;
  for (const segment of data.segments) {
    totalEmissions += calculateSegmentCarbonFootprint(segment);
  }
  if (data.hotelNights) {
    totalEmissions += data.hotelNights * HOTEL_EMISSIONS;
  }
  return totalEmissions;
};

export const calculateTreesNeeded = (carbonFootprint: number): number => {
  return carbonFootprint / 22;
};

export const calculateTotalDistance = (segments: TravelSegment[]) => {
  const byType: Record<string, number> = {};
  let totalDistanceForAllSegments = 0;

  for (const segment of segments) {
    const segmentDistance =
      (segment.distance || 0) *
      (segment.frequency || 1) *
      (segment.numberOfVehicles || 1); // Apply numberOfVehicles here

    if (segment.vehicleType) {
      byType[segment.vehicleType] =
        (byType[segment.vehicleType] || 0) + segmentDistance;
    }
    totalDistanceForAllSegments += segmentDistance;
  }

  return { totalDistance: totalDistanceForAllSegments, byType };
};
