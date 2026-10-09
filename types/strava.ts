export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number; // meters
  start_date_local: string;
  average_speed: number; // meters per second
  max_speed: number; // meters per second
  kilojoules?: number | null;
  average_heartrate?: number | null;
  max_heartrate?: number | null;
  gear_id?: string | null;
  athlete_count: number;
}

export interface StravaSegmentEffort {
  id: number;
  segment_id: number;
  name?: string;
  start_date_local: string;
  elapsed_time: number; // seconds
  moving_time?: number; // seconds
  distance?: number; // meters
  average_watts?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  pr_rank?: number | null;
}

export interface SegmentEffortResponse {
  segmentId: number | string;
  efforts: StravaSegmentEffort[];
}

export type RawRideRow = [
  string, // Date (start_date_local)
  string, // Name
  number, // Time (min)
  number, // Distance (mi)
  number, // Elevation (ft)
  number, // Avg Speed (mph)
  number, // Max Speed (mph)
  number | null | undefined, // Kilojoules
  number | null | undefined, // Avg Heart Rate
  number | null | undefined, // Max Heart Rate
  string | null | undefined, // Gear ID
  number // Athlete Count
];

export type RawSegmentEffortRow = [
  number | string, // Segment ID
  string, // Date (start_date_local)
  number // Elapsed time (seconds)
];

export interface DashboardStats {
  totalRides: number;
  totalDistanceMiles: number;
  totalElevationFeet: number;
  totalMovingTimeSeconds: number;
  avgSpeedMph: number;
}
