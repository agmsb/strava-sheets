'use client';

import React, { useState, useMemo } from 'react';
import { StravaActivity } from '@/types/strava';
import { formatRideData } from '@/lib/strava';
import { RAW_DATA_HEADERS, activitiesToCsv, activitiesToTsv, downloadFile } from '@/lib/export';
import { SortField, sortRides } from '@/lib/sort';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Copy,
  Check,
  Bike,
} from 'lucide-react';

interface ColumnConfig {
  field: SortField;
  headerIndex: number;
  align?: 'left' | 'right' | 'center';
  minWidth?: string;
}

const TABLE_COLUMNS: ColumnConfig[] = [
  { field: 'date', headerIndex: 0, align: 'left' },
  { field: 'name', headerIndex: 1, align: 'left', minWidth: 'min-w-[180px]' },
  { field: 'moving_time', headerIndex: 2, align: 'right' },
  { field: 'distance', headerIndex: 3, align: 'right' },
  { field: 'elevation', headerIndex: 4, align: 'right' },
  { field: 'avg_speed', headerIndex: 5, align: 'right' },
  { field: 'max_speed', headerIndex: 6, align: 'right' },
  { field: 'kilojoules', headerIndex: 7, align: 'right' },
  { field: 'avg_hr', headerIndex: 8, align: 'right' },
  { field: 'max_hr', headerIndex: 9, align: 'right' },
  { field: 'gear', headerIndex: 10, align: 'center' },
  { field: 'athletes', headerIndex: 11, align: 'center' },
];

interface TableHeaderCellProps {
  col: ColumnConfig;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  col,
  sortField,
  sortDirection,
  onSort,
}) => {
  const alignClass =
    col.align === 'right'
      ? 'text-right justify-end'
      : col.align === 'center'
      ? 'text-center justify-center'
      : 'text-left justify-start';

  const isSorted = sortField === col.field;

  return (
    <th
      onClick={() => onSort(col.field)}
      className={`group cursor-pointer px-4 py-3 hover:text-white transition-colors ${
        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
      } ${col.minWidth || ''}`}
    >
      <div className={`flex items-center gap-1.5 ${alignClass}`}>
        <span>{RAW_DATA_HEADERS[col.headerIndex]}</span>
        {!isSorted ? (
          <ArrowUpDown className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        ) : sortDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3 text-orange-400" />
        ) : (
          <ArrowDown className="h-3 w-3 text-orange-400" />
        )}
      </div>
    </th>
  );
};

interface ActivityTableRowProps {
  ride: StravaActivity;
}

const ActivityTableRow: React.FC<ActivityTableRowProps> = ({ ride }) => {
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
    <tr className="hover:bg-zinc-800/40 transition-colors">
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
};

interface ActivityTableProps {
  activities: StravaActivity[];
}

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
    return sortRides(filteredRides, sortField, sortDirection);
  }, [filteredRides, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
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
              {TABLE_COLUMNS.map((col) => (
                <TableHeaderCell
                  key={col.field}
                  col={col}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              ))}
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
              sortedRides.map((ride) => <ActivityTableRow key={ride.id} ride={ride} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
