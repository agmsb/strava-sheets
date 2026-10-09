import { describe, it, expect } from 'vitest';
import {
  METERS_TO_MILES,
  METERS_TO_FEET,
  M_PER_S_TO_MPH,
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
import { activitiesToCsv, activitiesToTsv, RAW_DATA_HEADERS } from '../export';

describe('Strava Metric Conversions', () => {
  it('converts meters to miles accurately using formula in code.js', () => {
    expect(METERS_TO_MILES).toBe(0.000621371);
    expect(metersToMiles(1000)).toBeCloseTo(0.621371, 5);
    expect(metersToMiles(1609.344)).toBeCloseTo(1.0, 3);
  });

  it('converts meters to feet accurately using formula in code.js', () => {
    expect(METERS_TO_FEET).toBe(3.28084);
    expect(metersToFeet(100)).toBeCloseTo(328.084, 3);
  });

  it('converts m/s to mph accurately using formula in code.js', () => {
    expect(M_PER_S_TO_MPH).toBe(2.23694);
    expect(mpsToMph(10)).toBeCloseTo(22.3694, 3);
  });

  it('converts seconds to minutes', () => {
    expect(secondsToMinutes(3600)).toBe(60);
    expect(secondsToMinutes(90)).toBe(1.5);
  });

  it('formats duration string correctly', () => {
    expect(formatDuration(5400)).toBe('1h 30m');
    expect(formatDuration(2700)).toBe('45m 0s');
    expect(formatDuration(45)).toBe('45s');
  });
});

describe('Strava Activity & Segment Formatting', () => {
  it('formats ride data into exact raw_data row structure matching code.js', () => {
    const activity = MOCK_ACTIVITIES[0];
    const row = formatRideData(activity);

    expect(row.length).toBe(12);
    expect(row[0]).toBe("2026-10-01T08:30:00Z"); // Date
    expect(row[1]).toBe("Morning Coastal Loop"); // Name
    expect(row[2]).toBe(90); // 5400 / 60
    expect(row[3]).toBeCloseTo(48280.3 * METERS_TO_MILES, 4); // Distance
    expect(row[4]).toBeCloseTo(457.2 * METERS_TO_FEET, 4); // Elevation
    expect(row[5]).toBeCloseTo(8.94 * M_PER_S_TO_MPH, 4); // Avg Speed
    expect(row[6]).toBeCloseTo(13.41 * M_PER_S_TO_MPH, 4); // Max Speed
    expect(row[7]).toBe(850); // Kilojoules
    expect(row[8]).toBe(148); // Avg HR
    expect(row[9]).toBe(172); // Max HR
    expect(row[10]).toBe("g12345"); // Gear ID
    expect(row[11]).toBe(3); // Athlete Count
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
    expect(formatted.length).toBe(1);
    expect(formatted[0]).toEqual(['284832', '2026-10-01T10:00:00Z', 1200]);
  });
});

describe('Dashboard Stats Calculation', () => {
  it('computes aggregated dashboard stats for ride activities', () => {
    const stats = computeDashboardStats(MOCK_ACTIVITIES);
    expect(stats.totalRides).toBe(5);
    expect(stats.totalDistanceMiles).toBeGreaterThan(160);
    expect(stats.totalElevationFeet).toBeGreaterThan(9000);
    expect(stats.totalMovingTimeSeconds).toBe(33800);
    expect(stats.avgSpeedMph).toBeGreaterThan(17);
  });
});

describe('Google Sheets Export Formatting', () => {
  it('generates CSV with matching raw_data headers from code.js', () => {
    const csv = activitiesToCsv(MOCK_ACTIVITIES);
    const lines = csv.split('\n');

    expect(lines[0]).toBe(RAW_DATA_HEADERS.join(','));
    expect(lines.length).toBe(MOCK_ACTIVITIES.length + 1);
    expect(lines[1]).toContain('Morning Coastal Loop');
  });

  it('generates TSV for direct paste into Google Sheets', () => {
    const tsv = activitiesToTsv(MOCK_ACTIVITIES);
    const lines = tsv.split('\t');
    expect(lines[0]).toBe('Date');
    expect(tsv).toContain('Morning Coastal Loop');
  });
});
