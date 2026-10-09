import { StravaActivity } from '@/types/strava';

export type SortField =
  | 'date'
  | 'name'
  | 'moving_time'
  | 'distance'
  | 'elevation'
  | 'avg_speed'
  | 'max_speed'
  | 'kilojoules'
  | 'avg_hr'
  | 'max_hr'
  | 'gear'
  | 'athletes';

export function getSortValue(activity: StravaActivity, field: SortField): number | string {
  switch (field) {
    case 'date':
      return new Date(activity.start_date_local).getTime();
    case 'name':
      return activity.name.toLowerCase();
    case 'moving_time':
      return activity.moving_time;
    case 'distance':
      return activity.distance;
    case 'elevation':
      return activity.total_elevation_gain;
    case 'avg_speed':
      return activity.average_speed;
    case 'max_speed':
      return activity.max_speed;
    case 'kilojoules':
      return activity.kilojoules || 0;
    case 'avg_hr':
      return activity.average_heartrate || 0;
    case 'max_hr':
      return activity.max_heartrate || 0;
    case 'gear':
      return activity.gear_id || '';
    case 'athletes':
      return activity.athlete_count;
  }
}

export function sortRides(
  rides: StravaActivity[],
  field: SortField,
  direction: 'asc' | 'desc'
): StravaActivity[] {
  return [...rides].sort((a, b) => {
    const valA = getSortValue(a, field);
    const valB = getSortValue(b, field);

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}
