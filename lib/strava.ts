import {
  StravaActivity,
  StravaSegmentEffort,
  SegmentEffortResponse,
  RawRideRow,
  RawSegmentEffortRow,
  DashboardStats,
} from '@/types/strava';

export const METERS_TO_MILES = 0.000621371;
export const METERS_TO_FEET = 3.28084;
export const M_PER_S_TO_MPH = 2.23694;

export function metersToMiles(meters: number): number {
  return meters * METERS_TO_MILES;
}

export function metersToFeet(meters: number): number {
  return meters * METERS_TO_FEET;
}

export function mpsToMph(mps: number): number {
  return mps * M_PER_S_TO_MPH;
}

export function secondsToMinutes(seconds: number): number {
  return seconds / 60;
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0m';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatRideData(activity: StravaActivity): RawRideRow {
  return [
    activity.start_date_local,
    activity.name,
    secondsToMinutes(activity.moving_time),
    metersToMiles(activity.distance),
    metersToFeet(activity.total_elevation_gain),
    mpsToMph(activity.average_speed),
    mpsToMph(activity.max_speed),
    activity.kilojoules ?? null,
    activity.average_heartrate ?? null,
    activity.max_heartrate ?? null,
    activity.gear_id ?? null,
    activity.athlete_count,
  ];
}

export function formatSegmentEffortData(
  efforts: StravaSegmentEffort[],
  segmentId: number | string
): RawSegmentEffortRow[] {
  return efforts.map((effort) => [
    segmentId,
    effort.start_date_local,
    effort.elapsed_time,
  ]);
}

export function computeDashboardStats(activities: StravaActivity[]): DashboardStats {
  const rides = activities.filter((act) => act.type === 'Ride');
  if (rides.length === 0) {
    return {
      totalRides: 0,
      totalDistanceMiles: 0,
      totalElevationFeet: 0,
      totalMovingTimeSeconds: 0,
      avgSpeedMph: 0,
    };
  }

  const totalRides = rides.length;
  const totalDistanceMeters = rides.reduce((acc, r) => acc + (r.distance || 0), 0);
  const totalElevationGainMeters = rides.reduce((acc, r) => acc + (r.total_elevation_gain || 0), 0);
  const totalMovingTimeSeconds = rides.reduce((acc, r) => acc + (r.moving_time || 0), 0);

  const totalDistanceMiles = metersToMiles(totalDistanceMeters);
  const totalElevationFeet = metersToFeet(totalElevationGainMeters);

  // Overall average speed: total distance / total time (if time > 0)
  const avgSpeedMps = totalMovingTimeSeconds > 0 ? totalDistanceMeters / totalMovingTimeSeconds : 0;
  const avgSpeedMph = mpsToMph(avgSpeedMps);

  return {
    totalRides,
    totalDistanceMiles,
    totalElevationFeet,
    totalMovingTimeSeconds,
    avgSpeedMph,
  };
}

export { MOCK_ACTIVITIES, MOCK_SEGMENT_EFFORTS } from './mockData';
