import { StravaActivity, StravaSegmentEffort } from '@/types/strava';

export const MOCK_ACTIVITIES: StravaActivity[] = [
  {
    id: 1001,
    name: 'Morning Coastal Loop',
    type: 'Ride',
    distance: 48280.3, // ~30 miles
    moving_time: 5400, // 1h 30m
    elapsed_time: 5700,
    total_elevation_gain: 457.2, // ~1500 ft
    start_date_local: '2026-10-01T08:30:00Z',
    average_speed: 8.94, // ~20 mph
    max_speed: 13.41, // ~30 mph
    kilojoules: 850,
    average_heartrate: 148,
    max_heartrate: 172,
    gear_id: 'g12345',
    athlete_count: 3,
  },
  {
    id: 1002,
    name: 'Mountain Pass Climb',
    type: 'Ride',
    distance: 64373.8, // ~40 miles
    moving_time: 9000, // 2h 30m
    elapsed_time: 9600,
    total_elevation_gain: 1219.2, // ~4000 ft
    start_date_local: '2026-10-03T07:15:00Z',
    average_speed: 7.15, // ~16 mph
    max_speed: 16.09, // ~36 mph
    kilojoules: 1450,
    average_heartrate: 156,
    max_heartrate: 181,
    gear_id: 'g12345',
    athlete_count: 1,
  },
  {
    id: 1003,
    name: 'Evening Recovery Ride',
    type: 'Ride',
    distance: 24140.2, // ~15 miles
    moving_time: 3200, // ~53m
    elapsed_time: 3400,
    total_elevation_gain: 152.4, // ~500 ft
    start_date_local: '2026-10-05T17:45:00Z',
    average_speed: 7.54, // ~16.8 mph
    max_speed: 11.17, // ~25 mph
    kilojoules: 380,
    average_heartrate: 128,
    max_heartrate: 145,
    gear_id: 'g67890',
    athlete_count: 2,
  },
  {
    id: 1004,
    name: 'Gran Fondo Training Ride',
    type: 'Ride',
    distance: 100584.0, // ~62.5 miles
    moving_time: 12600, // 3h 30m
    elapsed_time: 13800,
    total_elevation_gain: 914.4, // ~3000 ft
    start_date_local: '2026-10-07T06:30:00Z',
    average_speed: 7.98, // ~17.8 mph
    max_speed: 15.2, // ~34 mph
    kilojoules: 2100,
    average_heartrate: 151,
    max_heartrate: 176,
    gear_id: 'g12345',
    athlete_count: 5,
  },
  {
    id: 1005,
    name: 'Interval Sprint Workout',
    type: 'Ride',
    distance: 32186.9, // ~20 miles
    moving_time: 3600, // 1h
    elapsed_time: 3900,
    total_elevation_gain: 243.8, // ~800 ft
    start_date_local: '2026-10-08T12:00:00Z',
    average_speed: 8.94, // ~20 mph
    max_speed: 17.88, // ~40 mph
    kilojoules: 720,
    average_heartrate: 162,
    max_heartrate: 188,
    gear_id: 'g67890',
    athlete_count: 1,
  },
];

export const MOCK_SEGMENT_EFFORTS: Record<string, StravaSegmentEffort[]> = {
  '284832': [
    {
      id: 2001,
      segment_id: 284832,
      name: 'Old La Honda Road Climb',
      start_date_local: '2026-09-15T09:12:00Z',
      elapsed_time: 1140, // 19m 00s
      moving_time: 1140,
      distance: 5400,
      average_watts: 285,
      average_heartrate: 172,
      max_heartrate: 184,
      pr_rank: 1,
    },
    {
      id: 2002,
      segment_id: 284832,
      name: 'Old La Honda Road Climb',
      start_date_local: '2026-09-22T08:50:00Z',
      elapsed_time: 1185, // 19m 45s
      moving_time: 1180,
      distance: 5400,
      average_watts: 272,
      average_heartrate: 168,
      max_heartrate: 179,
      pr_rank: 2,
    },
    {
      id: 2003,
      segment_id: 284832,
      name: 'Old La Honda Road Climb',
      start_date_local: '2026-10-03T08:10:00Z',
      elapsed_time: 1230, // 20m 30s
      moving_time: 1225,
      distance: 5400,
      average_watts: 260,
      average_heartrate: 165,
      max_heartrate: 176,
      pr_rank: 3,
    },
  ],
  '123456': [
    {
      id: 2004,
      segment_id: 123456,
      name: 'Hawk Hill Sprint',
      start_date_local: '2026-10-01T09:00:00Z',
      elapsed_time: 480, // 8m 00s
      moving_time: 480,
      distance: 2900,
      average_watts: 310,
      average_heartrate: 175,
      max_heartrate: 185,
      pr_rank: 1,
    },
    {
      id: 2005,
      segment_id: 123456,
      name: 'Hawk Hill Sprint',
      start_date_local: '2026-10-07T07:20:00Z',
      elapsed_time: 510, // 8m 30s
      moving_time: 508,
      distance: 2900,
      average_watts: 295,
      average_heartrate: 171,
      max_heartrate: 182,
      pr_rank: 2,
    },
  ],
};
