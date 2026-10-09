'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StravaSegmentEffort } from '@/types/strava';
import { formatDuration } from '@/lib/strava';
import { segmentEffortsToCsv, segmentEffortsToTsv, downloadFile } from '@/lib/export';
import {
  Trophy,
  Search,
  Copy,
  Download,
  Check,
} from 'lucide-react';

interface SegmentSummaryCardsProps {
  segmentName: string;
  totalEfforts: number;
  bestTimeSeconds: number;
}

const SegmentSummaryCards: React.FC<SegmentSummaryCardsProps> = ({
  segmentName,
  totalEfforts,
  bestTimeSeconds,
}) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
    <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/80 p-3">
      <span className="text-xs text-zinc-500 font-medium uppercase">Segment Name</span>
      <p className="mt-1 text-sm font-bold text-white truncate">{segmentName}</p>
    </div>

    <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/80 p-3">
      <span className="text-xs text-zinc-500 font-medium uppercase">Total Attempts</span>
      <p className="mt-1 text-sm font-bold text-white">{totalEfforts} efforts</p>
    </div>

    <div className="rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-500/30 p-3">
      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase">
        <Trophy className="h-3.5 w-3.5" /> Best Time (PR)
      </div>
      <p className="mt-1 text-sm font-extrabold text-amber-400">
        {formatDuration(bestTimeSeconds)}
      </p>
    </div>
  </div>
);

interface SegmentEffortsTableProps {
  efforts: StravaSegmentEffort[];
  currentSegmentId: string;
  fastestEffortId: number;
  copied: boolean;
  onCopyTsv: () => void;
  onDownloadCsv: () => void;
}

const SegmentEffortsTable: React.FC<SegmentEffortsTableProps> = ({
  efforts,
  currentSegmentId,
  fastestEffortId,
  copied,
  onCopyTsv,
  onDownloadCsv,
}) => (
  <div className="rounded-lg border border-zinc-800 overflow-hidden">
    <div className="flex items-center justify-between bg-zinc-950/80 px-4 py-2 border-b border-zinc-800">
      <span className="text-xs font-semibold text-zinc-300">
        Raw Efforts Data (`segment_effort_data`)
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onCopyTsv}
          className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:text-white"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy TSV'}
        </button>
        <button
          onClick={onDownloadCsv}
          className="inline-flex items-center gap-1 rounded bg-orange-600/80 px-2 py-1 text-[11px] font-medium text-white hover:bg-orange-500"
        >
          <Download className="h-3 w-3" /> Export CSV
        </button>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-zinc-950/40 text-zinc-400 uppercase font-semibold">
          <tr>
            <th className="px-4 py-2">Segment ID</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Elapsed Time (s)</th>
            <th className="px-4 py-2 text-right">Formatted Time</th>
            <th className="px-4 py-2 text-right">Avg Power</th>
            <th className="px-4 py-2 text-right">Avg HR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
          {efforts.map((effort) => {
            const isPr = effort.id === fastestEffortId;
            const dateStr = new Date(effort.start_date_local).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <tr
                key={effort.id}
                className={`hover:bg-zinc-800/30 transition-colors ${
                  isPr ? 'bg-amber-500/5' : ''
                }`}
              >
                <td className="px-4 py-2 font-mono text-zinc-400">{currentSegmentId}</td>
                <td className="px-4 py-2 whitespace-nowrap">{dateStr}</td>
                <td className="px-4 py-2 font-mono text-orange-400">{effort.elapsed_time}</td>
                <td className="px-4 py-2 text-right font-mono font-semibold">
                  {formatDuration(effort.elapsed_time)}
                  {isPr && (
                    <span className="ml-1.5 inline-block rounded bg-amber-500/20 px-1 py-0.5 text-[10px] text-amber-400 uppercase font-bold">
                      PR
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-right font-mono">
                  {effort.average_watts ? `${Math.round(effort.average_watts)} W` : '-'}
                </td>
                <td className="px-4 py-2 text-right font-mono">
                  {effort.average_heartrate ? `${Math.round(effort.average_heartrate)} bpm` : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

interface SegmentViewerProps {
  isDemo: boolean;
  accessToken?: string;
}

export const SegmentViewer: React.FC<SegmentViewerProps> = ({ isDemo, accessToken }) => {
  const [segmentIdInput, setSegmentIdInput] = useState('284832');
  const [currentSegmentId, setCurrentSegmentId] = useState('284832');
  const [efforts, setEfforts] = useState<StravaSegmentEffort[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchEfforts = useCallback(
    async (id: string) => {
      if (!id.trim()) return;
      setLoading(true);
      setError(null);

      try {
        const url = `/api/strava/segments?segment_id=${encodeURIComponent(
          id.trim()
        )}${isDemo ? '&demo=true' : ''}`;

        const headers: Record<string, string> = {};
        if (accessToken && !isDemo) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch segment efforts');
        }

        setEfforts(data.efforts || []);
        setCurrentSegmentId(id.trim());
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error fetching segment efforts';
        setError(msg);
        setEfforts([]);
      } finally {
        setLoading(false);
      }
    },
    [isDemo, accessToken]
  );

  useEffect(() => {
    fetchEfforts(currentSegmentId);
  }, [fetchEfforts, currentSegmentId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEfforts(segmentIdInput);
  };

  const handlePresetSelect = (presetId: string) => {
    setSegmentIdInput(presetId);
    fetchEfforts(presetId);
  };

  const fastestEffort = [...efforts].sort((a, b) => a.elapsed_time - b.elapsed_time)[0];

  const handleCopyTsv = async () => {
    const tsv = segmentEffortsToTsv(efforts, currentSegmentId);
    await navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csv = segmentEffortsToCsv(efforts, currentSegmentId);
    downloadFile(csv, `segment_effort_data_${currentSegmentId}.csv`, 'text/csv');
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Segment Effort Lookup</h2>
            <p className="text-xs text-zinc-400">
              Analyze historical attempts for a Strava segment ID (matches segment_effort_data)
            </p>
          </div>
        </div>

        {/* Search Input & Quick Samples */}
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Segment ID (e.g. 284832)"
              value={segmentIdInput}
              onChange={(e) => setSegmentIdInput(e.target.value)}
              className="w-44 sm:w-52 rounded-lg border border-zinc-800 bg-zinc-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-500 transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Lookup'}
          </button>
        </form>
      </div>

      {/* Quick Presets */}
      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
        <span className="text-zinc-500 font-medium">Quick Examples:</span>
        <button
          type="button"
          onClick={() => handlePresetSelect('284832')}
          className={`rounded-md px-2 py-1 text-xs transition-colors ${
            currentSegmentId === '284832'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'bg-zinc-800 hover:text-white'
          }`}
        >
          Old La Honda (#284832)
        </button>
        <button
          type="button"
          onClick={() => handlePresetSelect('123456')}
          className={`rounded-md px-2 py-1 text-xs transition-colors ${
            currentSegmentId === '123456'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'bg-zinc-800 hover:text-white'
          }`}
        >
          Hawk Hill (#123456)
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {!loading && efforts.length > 0 && (
        <div className="mt-4 space-y-4">
          <SegmentSummaryCards
            segmentName={efforts[0]?.name || `Segment #${currentSegmentId}`}
            totalEfforts={efforts.length}
            bestTimeSeconds={fastestEffort.elapsed_time}
          />
          <SegmentEffortsTable
            efforts={efforts}
            currentSegmentId={currentSegmentId}
            fastestEffortId={fastestEffort.id}
            copied={copied}
            onCopyTsv={handleCopyTsv}
            onDownloadCsv={handleDownloadCsv}
          />
        </div>
      )}

      {!loading && efforts.length === 0 && (
        <p className="mt-4 text-center text-xs text-zinc-500">
          No segment efforts found for ID &quot;{currentSegmentId}&quot;. Try searching for Old La Honda (#284832).
        </p>
      )}
    </div>
  );
};

export default SegmentViewer;
