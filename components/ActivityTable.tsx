'use client';

import React, { useState, useMemo } from 'react';
import { StravaActivity } from '@/types/strava';
import { formatRideData } from '@/lib/strava';
import { RAW_DATA_HEADERS, activitiesToCsv, activitiesToTsv, downloadFile } from '@/lib/export';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  Bike,
} from 'lucide-react';

interface ActivityTableProps {
  activities: StravaActivity[];
}

type SortField =
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

export const ActivityTable: React.FC<ActivityTableProps> = ({ activities }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [copied, setCopied] = useState(false);

  // Filter rides only (matching CONFIG.rides in code.js)
  const ridesOnly = useMemo(() => {
    return activities.filter((act) => act.type === 'Ride');
  }, [activities]);

  const filteredRides = useMemo(() => {
    if (!searchTerm.trim()) return ridesOnly;
    const term = searchTerm.toLowerCase();
    return ridesOnly.filter(
      (ride) =>
        ride.name.toLowerCase().includes(term) ||
        (ride.gear_id && ride.gear_id.toLowerCase().includes(term)) ||
        ride.start_date_local.toLowerCase().includes(term)
    );
  }, [ridesOnly, searchTerm]);

  const sortedRides = useMemo(() => {
    return [...filteredRides].sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (sortField) {
        case 'date':
          valA = new Date(a.start_date_local).getTime();
          valB = new Date(b.start_date_local).getTime();
          break;
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'moving_time':
          valA = a.moving_time;
          valB = b.moving_time;
          break;
        case 'distance':
          valA = a.distance;
          valB = b.distance;
          break;
        case 'elevation':
          valA = a.total_elevation_gain;
          valB = b.total_elevation_gain;
          break;
        case 'avg_speed':
          valA = a.average_speed;
          valB = b.average_speed;
          break;
        case 'max_speed':
          valA = a.max_speed;
          valB = b.max_speed;
          break;
        case 'kilojoules':
          valA = a.kilojoules || 0;
          valB = b.kilojoules || 0;
          break;
        case 'avg_hr':
          valA = a.average_heartrate || 0;
          valB = b.average_heartrate || 0;
          break;
        case 'max_hr':
          valA = a.max_heartrate || 0;
          valB = b.max_heartrate || 0;
          break;
        case 'gear':
          valA = a.gear_id || '';
          valB = b.gear_id || '';
          break;
        case 'athletes':
          valA = a.athlete_count;
          valB = b.athlete_count;
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRides, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-orange-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-orange-400" />
    );
  };

  const handleCopyTsv = async () => {
    const tsv = activitiesToTsv(sortedRides);
    await navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csv = activitiesToCsv(sortedRides);
    downloadFile(csv, `strava_raw_data_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-sm overflow-hidden">
      {/* Header Controls Bar */}
      <div className="flex flex-col gap-4 border-b border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
            <Bike className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Ride Activities
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300">
                {sortedRides.length}
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Formatted for Google Sheets raw_data tab</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search rides, gear, dates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Copy for Google Sheets */}
          <button
            onClick={handleCopyTsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all"
            title="Copy TSV formatted data to paste directly into Google Sheets"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-orange-400" />
                <span>Copy for Sheets</span>
              </>
            )}
          </button>

          {/* Export CSV */}
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-500 transition-all shadow-sm"
            title="Download CSV for raw_data sheet"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase tracking-wider font-semibold">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="group cursor-pointer px-4 py-3 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>{RAW_DATA_HEADERS[0]}</span>
                  {renderSortIcon('date')}
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="group cursor-pointer px-4 py-3 hover:text-white transition-colors min-w-[180px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>{RAW_DATA_HEADERS[1]}</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th
                onClick={() => handleSort('moving_time')}
                className="group cursor-pointer px-4 py-3 text-right hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{RAW_DATA_HEADERS[2]}</span>
                  {renderSortIcon('moving_time')}
                </div>
              </th>
              <th
                onClick={() => handleSort('distance')}
                className="group cursor-pointer px-4 py-3 text-right hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{RAW_DATA_HEADERS[3]}</span>
                  {renderSortIcon('distance')}
                </div>
              </th>
              <th
                onClick={() => handleSort('elevation')}
                className="group cursor-pointer px-4 py-3 text-right hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{RAW_DATA_HEADERS[4]}</span>
                  {renderSortIcon('elevation')}
                </div>
              </th>
              <th
                onClick={() => handleSort('avg_speed')}
                className="group cursor-pointer px-4 py-3 text-right hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{RAW_DATA_HEADERS[5]}</span>
                  {renderSortIcon('avg_speed')}
                </div>
              </th>
              <th
                onClick={() => handleSort('max_speed')}
                className="group cursor-pointer px-4 py-3 text-right hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{RAW_DATA_HEADERS[6]}</span>
                  {renderSortIcon('max_speed')}
                </div>
              </th>
              <th
                onClick={() => handleSort('kilojoules')}
                className="group cursor-pointer px-4 py-3 text-right hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{RAW_DATA_HEADERS[7]}</span>
                  {renderSortIcon('kilojoules')}
                </div>
              </th>
              <th
                onClick={() => handleSort('avg_hr')}
                className="group cursor-pointer px-4 py-3 text-right hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{RAW_DATA_HEADERS[8]}</span>
                  {renderSortIcon('avg_hr')}
                </div>
              </th>
              <th
                onClick={() => handleSort('max_hr')}
                className="group cursor-pointer px-4 py-3 text-right hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>{RAW_DATA_HEADERS[9]}</span>
                  {renderSortIcon('max_hr')}
                </div>
              </th>
              <th
                onClick={() => handleSort('gear')}
                className="group cursor-pointer px-4 py-3 text-center hover:text-white transition-colors"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>{RAW_DATA_HEADERS[10]}</span>
                  {renderSortIcon('gear')}
                </div>
              </th>
              <th
                onClick={() => handleSort('athletes')}
                className="group cursor-pointer px-4 py-3 text-center hover:text-white transition-colors"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>{RAW_DATA_HEADERS[11]}</span>
                  {renderSortIcon('athletes')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
            {sortedRides.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-zinc-500">
                  No ride activities found. Try adjusting search filters or syncing data.
                </td>
              </tr>
            ) : (
              sortedRides.map((ride) => {
                const formatted = formatRideData(ride);
                const [
                  dateStr,
                  nameStr,
                  timeMin,
                  distMi,
                  elevFt,
                  avgSpeedMph,
                  maxSpeedMph,
                  kj,
                  avgHr,
                  maxHr,
                  gearId,
                  athleteCnt,
                ] = formatted;

                const formattedDate = new Date(dateStr).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <tr key={ride.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-400">{formattedDate}</td>
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{nameStr}</td>
                    <td className="px-4 py-3 text-right font-mono">{Number(timeMin).toFixed(1)}</td>
                    <td className="px-4 py-3 text-right font-mono text-orange-400 font-semibold">
                      {Number(distMi).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{Math.round(Number(elevFt))}</td>
                    <td className="px-4 py-3 text-right font-mono">{Number(avgSpeedMph).toFixed(1)}</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-400">
                      {Number(maxSpeedMph).toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{kj ? Math.round(Number(kj)) : '-'}</td>
                    <td className="px-4 py-3 text-right font-mono">{avgHr ? Math.round(Number(avgHr)) : '-'}</td>
                    <td className="px-4 py-3 text-right font-mono">{maxHr ? Math.round(Number(maxHr)) : '-'}</td>
                    <td className="px-4 py-3 text-center font-mono text-zinc-400">{gearId || '-'}</td>
                    <td className="px-4 py-3 text-center">{athleteCnt}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
