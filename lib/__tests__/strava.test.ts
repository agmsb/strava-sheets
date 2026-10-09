import { describe, it, expect } from 'vitest';
import {
  metersToMiles,
  metersToFeet,
  mpsToMph,
  secondsToMinutes,
  formatDuration,
  formatRideData,
  formatSegmentEffortData,
  computeDashboardStats,
  MOCK_ACTIVITIES,
} from '../strava';
import { activitiesToCsv, RAW_DATA_HEADERS } from '../export';

describe('Unit Conversions & Math', () => {
  it('converts metrics correctly', () => {
    expect(metersToMiles(1609.344)).toBeCloseTo(1.0, 3);
    expect(metersToFeet(100)).toBeCloseTo(328.084, 3);
    expect(mpsToMph(10)).toBeCloseTo(22.3694, 3);
    expect(secondsToMinutes(3600)).toBe(60);
  });

  it('formats duration string correctly', () => {
    expect(formatDuration(5400)).toBe('1h 30m');
    expect(formatDuration(2700)).toBe('45m 0s');
    expect(formatDuration(45)).toBe('45s');
  });
});

describe('Data Formatting & Transformation', () => {
  it('formats ride activity row matching raw_data schema', () => {
    const activity = MOCK_ACTIVITIES[0];
    const row = formatRideData(activity);

    expect(row).toHaveLength(12);
    expect(row[0]).toBe('2026-10-01T08:30:00Z');
    expect(row[1]).toBe('Morning Coastal Loop');
    expect(row[2]).toBe(90);
    expect(row[3]).toBeCloseTo(30, 0);
  });

  it('formats segment effort data correctly', () => {
    const efforts = [
      {
        id: 1,
        segment_id: 284832,
        start_date_local: '2026-10-01T10:00:00Z',
        elapsed_time: 1200,
      },
    ];
    const formatted = formatSegmentEffortData(efforts, '284832');
    expect(formatted).toEqual([['284832', '2026-10-01T10:00:00Z', 1200]]);
  });
});

describe('Dashboard Aggregations', () => {
  it('computes aggregated dashboard stats for ride activities', () => {
    const stats = computeDashboardStats(MOCK_ACTIVITIES);
    expect(stats.totalRides).toBe(5);
    expect(stats.totalDistanceMiles).toBeGreaterThan(160);
    expect(stats.totalElevationFeet).toBeGreaterThan(9000);
    expect(stats.totalMovingTimeSeconds).toBe(33800);
    expect(stats.avgSpeedMph).toBeGreaterThan(17);
  });
});

describe('Google Sheets Export', () => {
  it('generates CSV with matching raw_data headers', () => {
    const csv = activitiesToCsv(MOCK_ACTIVITIES);
    const lines = csv.split('\n');

    expect(lines[0]).toBe(RAW_DATA_HEADERS.join(','));
    expect(lines).toHaveLength(MOCK_ACTIVITIES.length + 1);
    expect(lines[1]).toContain('Morning Coastal Loop');
  });
});
