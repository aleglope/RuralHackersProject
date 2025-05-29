import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Leaf, Route, Building, Users, BedDouble, Car } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Tables } from "../types/Database";

interface EventResult {
  total_carbon_footprint: number;
  total_distance: number;
  total_hotel_nights: number;
  transport_data_submissions_count: number;
  accommodation_data_submissions_count: number;
  by_user_type: Record<
    string,
    {
      carbon_footprint: number;
      distance: number;
    }
  >;
  by_transport_type: Record<
    string,
    {
      distance: number;
      trips: number;
    }
  >;
}

const EventResults = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<EventResult | null>(null);
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      // console.log(`Fetching results for slug: ${slug}`);
      try {
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("id, name")
          .eq("slug", slug)
          .single();

        // console.log("Event data:", eventData, "Event error:", eventError);
        if (eventError) throw eventError;
        if (!eventData) throw new Error("Event not found");
        setEventName(eventData.name);

        const { data: submissionsData, error: submissionsError } =
          await supabase
            .from("travel_data_submissions")
            .select("id, total_hotel_nights, user_type")
            .eq("event_id", eventData.id);

        // console.log(
        //   "Submissions data:",
        //   submissionsData,
        //   "Submissions error:",
        //   submissionsError
        // );
        if (submissionsError) throw submissionsError;

        if (!submissionsData || submissionsData.length === 0) {
          // console.log("No submissions data found, setting empty results.");
          setResults({
            total_carbon_footprint: 0,
            total_distance: 0,
            total_hotel_nights: 0,
            transport_data_submissions_count: 0,
            accommodation_data_submissions_count: 0,
            by_user_type: {},
            by_transport_type: {},
          });
          setLoading(false);
          return;
        }

        const submissionIds = submissionsData.map((s) => s.id);
        // console.log("Submission IDs:", submissionIds);

        const { data: segmentsData, error: segmentsError } = await supabase
          .from("travel_segments")
          .select(
            "submission_id, calculated_carbon_footprint, distance, vehicle_type, fuel_type"
          )
          .in("submission_id", submissionIds);

        // console.log(
        //   "Segments data:",
        //   segmentsData,
        //   "Segments error:",
        //   segmentsError
        // );
        if (segmentsError) throw segmentsError;

        const aggregatedResults: EventResult = {
          total_carbon_footprint: 0,
          total_distance: 0,
          total_hotel_nights: 0,
          transport_data_submissions_count: 0,
          accommodation_data_submissions_count: 0,
          by_user_type: {},
          by_transport_type: {},
        };

        // console.log(
        //   "Initial aggregatedResults:",
        //   JSON.parse(JSON.stringify(aggregatedResults))
        // );

        submissionsData.forEach((submission) => {
          if (
            submission.total_hotel_nights &&
            submission.total_hotel_nights > 0
          ) {
            aggregatedResults.total_hotel_nights +=
              submission.total_hotel_nights;
            aggregatedResults.accommodation_data_submissions_count += 1;
          }
        });
        // console.log(
        //   "After submissions aggregation:",
        //   JSON.parse(JSON.stringify(aggregatedResults))
        // );

        const submissionsWithSegments = new Set(
          segmentsData?.map((s) => s.submission_id) || []
        );
        aggregatedResults.transport_data_submissions_count =
          submissionsWithSegments.size;
        // console.log(
        //   "After transport count:",
        //   JSON.parse(JSON.stringify(aggregatedResults))
        // );

        if (segmentsData) {
          segmentsData.forEach((segment) => {
            aggregatedResults.total_carbon_footprint +=
              segment.calculated_carbon_footprint || 0;
            aggregatedResults.total_distance += segment.distance || 0;

            const parentSubmission = submissionsData.find(
              (s) => s.id === segment.submission_id
            );
            const userType = parentSubmission?.user_type || "unknown";

            if (!aggregatedResults.by_user_type[userType]) {
              aggregatedResults.by_user_type[userType] = {
                carbon_footprint: 0,
                distance: 0,
              };
            }
            aggregatedResults.by_user_type[userType].carbon_footprint +=
              segment.calculated_carbon_footprint || 0;
            aggregatedResults.by_user_type[userType].distance +=
              segment.distance || 0;

            if (segment.vehicle_type) {
              if (!aggregatedResults.by_transport_type[segment.vehicle_type]) {
                aggregatedResults.by_transport_type[segment.vehicle_type] = {
                  distance: 0,
                  trips: 0,
                };
              }
              aggregatedResults.by_transport_type[
                segment.vehicle_type
              ].distance += segment.distance || 0;
              aggregatedResults.by_transport_type[
                segment.vehicle_type
              ].trips += 1;
            } else {
              // console.warn(
              //   "Segment with null or undefined vehicle_type:",
              //   segment
              // );
            }
          });
        }
        // console.log(
        //   "Final aggregatedResults:",
        //   JSON.parse(JSON.stringify(aggregatedResults))
        // );

        setResults(aggregatedResults);
      } catch (error) {
        // console.error("Error in fetchResults processing:", error);
        setResults(null);
      } finally {
        setLoading(false);
        // console.log("Finished fetching results.");
      }
    };

    if (slug) {
      fetchResults();
    } else {
      // console.log("No slug provided, not fetching results.");
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t("results.noData")}</p>
      </div>
    );
  }

  const treesNeeded = Math.ceil(results.total_carbon_footprint / 22);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{eventName}</h1>
        <p className="text-muted-foreground">
          {t("results.aggregatedResults")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-success">
            <Leaf className="h-4 w-4" />
            <h3 className="font-medium">{t("results.totalCarbonFootprint")}</h3>
          </div>
          <p className="stat-value">
            {results.total_carbon_footprint.toFixed(2)} kg CO₂e
          </p>
          <p className="stat-label">
            {t("results.treesNeeded", { count: treesNeeded })}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 text-primary">
            <Route className="h-4 w-4" />
            <h3 className="font-medium">{t("results.totalDistance")}</h3>
          </div>
          <p className="stat-value">{results.total_distance.toFixed(2)} km</p>
          <p className="stat-label">{t("results.distanceLabel")}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Car className="h-4 w-4" />
            <h3 className="font-medium">
              {t("results.transportDataReported")}
            </h3>
          </div>
          <p className="stat-value">
            {results.transport_data_submissions_count}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BedDouble className="h-4 w-4" />
            <h3 className="font-medium">
              {t("results.accommodationDataReported")}
            </h3>
          </div>
          <p className="stat-value">
            {results.accommodation_data_submissions_count}
          </p>
          <p className="stat-label">
            {t("results.nightsLabel")}: {results.total_hotel_nights}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {t("results.byUserType")}
          </h3>
          <div className="space-y-4">
            {Object.entries(results.by_user_type).map(([type, stats]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {t(`userType.${type}`, type)}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{t("results.carbonFootprint")}:</span>
                    <span>{stats.carbon_footprint.toFixed(2)} kg CO₂e</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("results.distance")}:</span>
                    <span>{stats.distance.toFixed(2)} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {t("results.byTransportType")}
          </h3>
          <div className="space-y-4">
            {Object.entries(results.by_transport_type).map(([type, stats]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {t(`transport.${type}`, type)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stats.distance.toFixed(2)} km
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t("results.trips")}:</span>
                  <span>{stats.trips}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventResults;
