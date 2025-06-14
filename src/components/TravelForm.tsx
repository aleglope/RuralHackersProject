import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  useForm,
  FormProvider,
  useWatch,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserType,
  TravelData,
  AccreditedRole,
  TransportServiceType,
} from "../types";
import {
  VISIBLE_USER_TYPES,
  ALL_ACCREDITED_ROLES,
  ALL_TRANSPORT_SERVICE_TYPES,
  ACCOMMODATION_REQUIRED_USER_TYPES,
} from "../constants";
import TravelSegment from "./TravelSegment";
import ResultsSection from "./ResultsSection";
import { supabase } from "../lib/supabase";
import { calculateSegmentCarbonFootprint } from "../utils/calculations";

const travelFormSchema = z
  .object({
    userType: z.enum([
      "public",
      "participant",
      "event_staff_accredited",
      "internal_staff_organization",
      "transport_services_stakeholders",
      "provider",
      "logistics",
      "staff",
      "other",
    ]),
    userTypeOtherDetails: z.string().optional(),
    accreditedRole: z
      .enum([
        "loc",
        "vip",
        "timing",
        "photo",
        "media",
        "tv_production",
        "sports_delegations",
        "other_accredited_role",
      ])
      .optional(),
    accreditedRoleOtherDetails: z.string().optional(),
    organizationStaffDetails: z.string().optional(),
    transportServiceType: z
      .enum(["spectator_shuttle_bus", "team_transport_services"])
      .optional(),
    segments: z.array(
      z
        .object({
          vehicleType: z.enum([
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
          ]),
          vehicleTypeOtherDetails: z.string().optional(),
          fuelType: z
            .enum([
              "gasoline",
              "diesel",
              "hybrid",
              "pluginHybrid",
              "electric",
              "unknown",
            ])
            .optional(),
          passengers: z.number().min(1).optional(),
          vanSize: z.enum(["<7.5t", "7.5-12t"]).optional(),
          truckSize: z
            .enum(["<7.5t", "7.5-12t", "20-26t", "34-40t", "50-60t"])
            .optional(),
          carbonCompensated: z.boolean().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          distance: z.number().min(0).optional(),
          origin: z.string().min(1, { message: "validation.originRequired" }),
          destination: z
            .string()
            .min(1, { message: "validation.destinationRequired" }),
          frequency: z.number().min(1).optional(),
          numberOfVehicles: z.number().min(1).optional(),
        })
        .superRefine((data, ctx) => {
          if (
            data.vehicleType === "other" &&
            (!data.vehicleTypeOtherDetails ||
              data.vehicleTypeOtherDetails.trim() === "")
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["vehicleTypeOtherDetails"],
              message: "validation.vehicleTypeOtherRequired",
            });
          }
          if (
            data.startDate &&
            data.endDate &&
            new Date(data.endDate) < new Date(data.startDate)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["endDate"],
              message: "validation.endDateAfterStartDate",
            });
          }
        })
    ),
    hotelNights: z.number().min(0).optional(),
    comments: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.userType === "other" &&
      (typeof data.userTypeOtherDetails !== "string" ||
        data.userTypeOtherDetails.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["userTypeOtherDetails"],
        message: "userType.specifyOther",
      });
    }
    if (
      data.userType === "event_staff_accredited" &&
      data.accreditedRole === "other_accredited_role" &&
      (typeof data.accreditedRoleOtherDetails !== "string" ||
        data.accreditedRoleOtherDetails.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accreditedRoleOtherDetails"],
        message: "userType.specifyAccreditedRoleOther",
      });
    }
  });

const defaultSegment = {
  vehicleType: "car" as const,
  fuelType: "diesel" as const,
  passengers: 1,
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  distance: 500,
  origin: "Madrid",
  destination: "Pontevedra",
  frequency: 1,
  vehicleTypeOtherDetails: "",
  numberOfVehicles: 1,
};

const UserTypeOtherInput = () => {
  const { t } = useTranslation();
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  const userType = useWatch({ control, name: "userType" });

  if (userType === "other") {
    return (
      <div className="mt-4">
        <label
          htmlFor="userTypeOtherDetails"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t("userType.specifyOther")}
        </label>
        <input
          type="text"
          id="userTypeOtherDetails"
          {...register("userTypeOtherDetails")}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
        />
        {errors.userTypeOtherDetails && (
          <p className="mt-1 text-sm text-red-600">
            {errors.userTypeOtherDetails.message?.toString()}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const AccreditedRoleInput = () => {
  const { t } = useTranslation();
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<TravelData>();
  const userType = useWatch({ control, name: "userType" });
  const accreditedRole = useWatch({ control, name: "accreditedRole" });

  if (userType === "event_staff_accredited") {
    return (
      <div className="mt-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            {t("userType.accreditedRole")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ALL_ACCREDITED_ROLES.map((role) => (
              <label
                key={role}
                className={`relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-green-50 transition-colors ${
                  accreditedRole === role
                    ? "bg-green-50 border-green-500"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  {...register("accreditedRole")}
                  value={role}
                  className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="ml-3 text-sm">{t(`userType.${role}`)}</span>
              </label>
            ))}
          </div>
          {errors.accreditedRole && (
            <p className="mt-2 text-sm text-red-600">
              {errors.accreditedRole.message?.toString()}
            </p>
          )}
        </div>
        {accreditedRole === "other_accredited_role" && (
          <div>
            <label
              htmlFor="accreditedRoleOtherDetails"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("userType.specifyAccreditedRoleOther")}
            </label>
            <input
              type="text"
              id="accreditedRoleOtherDetails"
              {...register("accreditedRoleOtherDetails")}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder={t("userType.specifyAccreditedRoleOther")}
            />
            {errors.accreditedRoleOtherDetails && (
              <p className="mt-1 text-sm text-red-600">
                {errors.accreditedRoleOtherDetails.message?.toString()}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const OrganizationStaffDetailsInput = () => {
  const { t } = useTranslation();
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<TravelData>();
  const userType = useWatch({ control, name: "userType" });

  if (userType === "internal_staff_organization") {
    return (
      <div className="mt-4">
        <label
          htmlFor="organizationStaffDetails"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t("userType.organizationStaffDetails")}
        </label>
        <textarea
          id="organizationStaffDetails"
          {...register("organizationStaffDetails")}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          rows={3}
        />
        {errors.organizationStaffDetails && (
          <p className="mt-1 text-sm text-red-600">
            {errors.organizationStaffDetails.message?.toString()}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const TransportServiceTypeInput = () => {
  const { t } = useTranslation();
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<TravelData>();
  const userType = useWatch({ control, name: "userType" });
  const transportServiceType = useWatch({
    control,
    name: "transportServiceType",
  });

  if (userType === "transport_services_stakeholders") {
    return (
      <div className="mt-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            {t("userType.transportServiceType")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_TRANSPORT_SERVICE_TYPES.map((type) => (
              <label
                key={type}
                className={`relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-green-50 transition-colors ${
                  transportServiceType === type
                    ? "bg-green-50 border-green-500"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  {...register("transportServiceType")}
                  value={type}
                  className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span className="ml-3 text-sm">{t(`userType.${type}`)}</span>
              </label>
            ))}
          </div>
          {errors.transportServiceType && (
            <p className="mt-2 text-sm text-red-600">
              {errors.transportServiceType.message?.toString()}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const TravelForm = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TravelData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const methods = useForm<TravelData>({
    resolver: zodResolver(travelFormSchema),
    defaultValues: {
      segments: [defaultSegment],
      userType: undefined,
      userTypeOtherDetails: "",
      accreditedRole: undefined,
      accreditedRoleOtherDetails: "",
      organizationStaffDetails: "",
      transportServiceType: undefined,
    },
    mode: "onChange",
  });

  const userTypes = VISIBLE_USER_TYPES;

  const saveToDatabase = async (data: TravelData) => {
    setIsSubmitting(true);
    try {
      // 1. Get event_id from slug
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("id")
        .eq("slug", slug)
        .single();

      if (eventError) throw eventError;
      if (!eventData) throw new Error("Event not found during save operation");

      // 2. Prepare and insert into travel_data_submissions
      const submissionInsertData = {
        event_id: eventData.id,
        user_type: data.userType,
        user_type_other_details:
          data.userType === "other" ? data.userTypeOtherDetails : null,
        accredited_role: data.accreditedRole,
        accredited_role_other_details:
          data.accreditedRole === "other_accredited_role"
            ? data.accreditedRoleOtherDetails
            : null,
        organization_staff_details: data.organizationStaffDetails,
        transport_service_type: data.transportServiceType,
        total_hotel_nights: data.hotelNights,
        comments: data.comments,
      };

      const { data: submissionResult, error: submissionError } = await supabase
        .from("travel_data_submissions")
        .insert(submissionInsertData)
        .select("id") // Important to get the ID of the new submission
        .single(); // Assuming we expect one row back

      if (submissionError) throw submissionError;
      if (!submissionResult || !submissionResult.id)
        throw new Error("Failed to insert submission or retrieve ID");

      const submissionId = submissionResult.id;

      // 3. Prepare and insert into travel_segments
      if (data.segments && data.segments.length > 0) {
        const segmentsToInsert = data.segments.map((segment) => {
          const carbonFootprint = calculateSegmentCarbonFootprint(segment);
          return {
            submission_id: submissionId,
            vehicle_type: segment.vehicleType,
            vehicle_type_other_details:
              segment.vehicleType === "other"
                ? segment.vehicleTypeOtherDetails
                : null,
            fuel_type: segment.fuelType,
            passengers: segment.passengers,
            van_size: segment.vanSize,
            truck_size: segment.truckSize,
            calculated_carbon_footprint: carbonFootprint,
            carbon_compensated: segment.carbonCompensated,
            start_date: segment.startDate,
            end_date: segment.endDate,
            distance: segment.distance,
            origin: segment.origin,
            destination: segment.destination,
            frequency: segment.frequency,
            number_of_vehicles: segment.numberOfVehicles,
          };
        });

        const { error: segmentsError } = await supabase
          .from("travel_segments")
          .insert(segmentsToInsert);

        if (segmentsError) throw segmentsError;
      }

      return true;
    } catch (error) {
      console.error("Error saving data to database:", error);
      // Consider more specific error messages for the user based on error type
      let errorMessage = t("error.savingData");
      if (
        error instanceof Error &&
        error.message.includes("unique constraint")
      ) {
        errorMessage = t("error.duplicateEntry"); // Example for a new translation key
      } else if (error instanceof Error) {
        errorMessage = error.message; // Or provide the raw error message if it's informative
      }
      // alert(errorMessage); // Alerting directly might be too intrusive, handle via state/toast
      methods.setError("root.serverError", {
        type: "manual",
        message: errorMessage,
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: TravelData) => {
    if (step < maxSteps) {
      setStep(step + 1);
    } else {
      const success = await saveToDatabase(data);
      if (success) {
        // setFormData(data); // Not strictly needed if navigating away
        navigate(`/event/${slug}/results`); // Navigate to a success/results page
      } else {
        // Error is handled by saveToDatabase setting form error
        // alert(t('error.savingData')); // Already handled
      }
    }
  };

  const addSegment = () => {
    const segments = methods.getValues("segments") || [];
    methods.setValue("segments", [...segments, defaultSegment]);
  };

  const removeSegment = (index: number) => {
    const segments = methods.getValues("segments") || [];
    if (segments.length > 1) {
      const newSegments = segments.filter((_, i) => i !== index);
      methods.setValue("segments", newSegments);
    }
  };

  const [step, setStep] = useState(1);
  const currentUserType = methods.watch("userType");
  const shouldShowAccommodationStep =
    ACCOMMODATION_REQUIRED_USER_TYPES.includes(currentUserType as UserType);

  const maxSteps = shouldShowAccommodationStep ? 4 : 3;

  if (step === maxSteps && formData) {
    return <ResultsSection data={formData} onBack={() => setStep(step - 1)} />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t("userType.title")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {userTypes.map((type) => (
                <label
                  key={type}
                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-green-50 ${
                    methods.watch("userType") === type
                      ? "bg-green-50 border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    {...methods.register("userType")}
                    value={type}
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <span className="ml-3">{t(`userType.${type}`)}</span>
                </label>
              ))}
            </div>
            {methods.formState.errors.userType && (
              <p className="mt-1 text-sm text-red-600">
                {typeof methods.formState.errors.userType.message ===
                  "string" && t(methods.formState.errors.userType.message)}
              </p>
            )}
            {methods.formState.errors.root?.serverError && (
              <p className="mt-2 text-sm text-red-600">
                {methods.formState.errors.root.serverError.message}
              </p>
            )}
            <UserTypeOtherInput />
            <AccreditedRoleInput />
            <OrganizationStaffDetailsInput />
            <TransportServiceTypeInput />
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t("transport.segments")}
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              {t("userType.title")}:{" "}
              <span className="font-medium">
                {t(
                  methods.watch("userType")
                    ? `userType.${methods.watch("userType")}`
                    : ""
                )}
              </span>
            </p>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-semibold text-blue-700">
                {t("transport.segmentsExampleTitle")}
              </p>
              <p className="text-sm text-blue-600">
                {t("transport.segmentsExampleBody")}
              </p>
            </div>

            {methods.watch("segments")?.map((_, index) => (
              <TravelSegment
                key={index}
                index={index}
                onRemove={() => removeSegment(index)}
              />
            ))}
            <button
              type="button"
              onClick={addSegment}
              className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {t("transport.addSegment")}
            </button>
          </div>
        )}

        {step === 3 && shouldShowAccommodationStep && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t("accommodation.title")}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("accommodation.nights")}
              </label>
              <input
                type="number"
                min="0"
                {...methods.register("hotelNights", { valueAsNumber: true })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              {methods.formState.errors.hotelNights && (
                <p className="mt-1 text-sm text-red-600">
                  {t("accommodation.nightsInvalid")}
                </p>
              )}
            </div>
          </div>
        )}

        {((shouldShowAccommodationStep && step === 4) ||
          (!shouldShowAccommodationStep && step === 3)) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("common.comments")}
            </label>
            <textarea
              {...methods.register("comments")}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              rows={4}
            />
          </div>
        )}

        <div className="flex justify-between space-x-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {t("common.back")}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting
              ? t("common.submitting")
              : step < maxSteps
              ? t("common.next")
              : t("common.submit")}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default TravelForm;
