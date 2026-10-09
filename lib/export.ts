import { StravaActivity, StravaSegmentEffort } from '@/types/strava';
import { formatRideData, formatSegmentEffortData } from './strava';

export const RAW_DATA_HEADERS = [
  'Date',
  'Name',
  'Time (min)',
  'Distance (mi)',
  'Elevation (ft)',
  'Avg Speed (mph)',
  'Max Speed (mph)',
  'Kilojoules',
  'Avg Heart Rate',
  'Max Heart Rate',
  'Gear ID',
  'Athlete Count',
];

export const SEGMENT_EFFORT_HEADERS = ['Segment ID', 'Date', 'Elapsed Time (s)'];

export const DASHBOARD_HEADERS = [
  'Total Distance (mi)',
  'Total Elevation (ft)',
  'Total Rides',
  'Average Speed (mph)',
];

export const DASHBOARD_FORMULAS = [
  '=SUM(raw_data!D2:D)',
  '=SUM(raw_data!E2:E)',
  '=COUNTA(raw_data!A2:A)',
  '=IFERROR(AVERAGE(raw_data!F2:F), 0)',
];


function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function roundNumber(val: unknown, decimals = 2): unknown {
  if (typeof val === 'number') {
    return Number(val.toFixed(decimals));
  }
  return val;
}

export function generateRideRows(activities: StravaActivity[]) {
  return activities
    .filter((act) => act.type === 'Ride')
    .map((act) => {
      const row = formatRideData(act);
      return row.map((cell) => roundNumber(cell, 2));
    });
}

export function activitiesToCsv(activities: StravaActivity[]): string {
  const rows = generateRideRows(activities);
  const csvLines = [
    RAW_DATA_HEADERS.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  return csvLines.join('\n');
}

export function activitiesToTsv(activities: StravaActivity[]): string {
  const rows = generateRideRows(activities);
  const tsvLines = [
    RAW_DATA_HEADERS.join('\t'),
    ...rows.map((row) => row.map((val) => (val === null || val === undefined ? '' : String(val))).join('\t')),
  ];
  return tsvLines.join('\n');
}

export function segmentEffortsToCsv(efforts: StravaSegmentEffort[], segmentId: number | string): string {
  const formatted = formatSegmentEffortData(efforts, segmentId);
  const lines = [
    SEGMENT_EFFORT_HEADERS.map(escapeCsvCell).join(','),
    ...formatted.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  return lines.join('\n');
}

export function segmentEffortsToTsv(efforts: StravaSegmentEffort[], segmentId: number | string): string {
  const formatted = formatSegmentEffortData(efforts, segmentId);
  const lines = [
    SEGMENT_EFFORT_HEADERS.join('\t'),
    ...formatted.map((row) => row.map((val) => (val === null || val === undefined ? '' : String(val))).join('\t')),
  ];
  return lines.join('\n');
}

export function dashboardToCsv(): string {
  const lines = [
    DASHBOARD_HEADERS.map(escapeCsvCell).join(','),
    DASHBOARD_FORMULAS.map(escapeCsvCell).join(','),
  ];
  return lines.join('\n');
}


export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
