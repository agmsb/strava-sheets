'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StravaActivity } from '@/types/strava';
import {
  computeDashboardStats,
  formatDuration,
  MOCK_ACTIVITIES,
} from '@/lib/strava';
import { StatCard } from '@/components/StatCard';
import { ActivityTable } from '@/components/ActivityTable';
import { SyncButton } from '@/components/SyncButton';
import { SegmentViewer } from '@/components/SegmentViewer';
import {
  Bike,
  Navigation,
  Mountain,
  Clock,
  Gauge,
  FileSpreadsheet,
  Zap,
  Info,
} from 'lucide-react';

interface DashboardBannersProps {
  error: string | null;
  isDemo: boolean;
  onSwitchToDemo: () => void;
}

const DashboardBanners: React.FC<DashboardBannersProps> = ({
  error,
  isDemo,
  onSwitchToDemo,
}) => {
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
        <button
          onClick={onSwitchToDemo}
          className="rounded bg-red-500/20 px-2 py-1 text-[11px] font-semibold hover:bg-red-500/30 text-white"
        >
          Switch to Demo Mode
        </button>
      </div>
    );
  }

  if (isDemo) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Demo Mode Active:</strong> You are viewing realistic sample Strava ride activities and segment efforts matching the `raw_data` schema in `code.js`.
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export default function DashboardPage() {
  const [isDemo, setIsDemo] = useState(true);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [activities, setActivities] = useState<StravaActivity[]>(MOCK_ACTIVITIES);
  const [loading, setLoading] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(
    async (tokenOverride?: string) => {
      setLoading(true);
      setError(null);
      const tokenToUse = tokenOverride || accessToken;

      try {
        const url = `/api/strava/activities?demo=${isDemo ? 'true' : 'false'}`;
        const headers: Record<string, string> = {};
        if (tokenToUse && !isDemo) {
          headers['Authorization'] = `Bearer ${tokenToUse}`;
        }

        const res = await fetch(url, { headers });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch activities');
        }

        setActivities(data.activities || []);
        setLastSyncedAt(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
        if (tokenOverride) {
          setAccessToken(tokenOverride);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error syncing activities';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [isDemo, accessToken]
  );

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const stats = useMemo(() => {
    return computeDashboardStats(activities);
  }, [activities]);

  const handleToggleDemo = () => {
    setIsDemo((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 font-bold text-white shadow-md shadow-orange-600/20">
              <Bike className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white">
                  Strava Sheets
                </h1>
                <span className="rounded bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 text-[10px] font-bold text-orange-400 uppercase">
                  MVP
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Google Sheets Integration & Ride Analytics
              </p>
            </div>
          </div>

          <SyncButton
            isDemo={isDemo}
            isLoading={loading}
            onSync={(token) => fetchActivities(token)}
            onToggleDemo={handleToggleDemo}
            lastSyncedAt={lastSyncedAt}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Alert for Demo or Error */}
        <DashboardBanners
          error={error}
          isDemo={isDemo}
          onSwitchToDemo={() => setIsDemo(true)}
        />

        {/* High-Level Stat Cards Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              Overview Performance Metrics
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Total Rides"
              value={stats.totalRides}
              unit="rides"
              icon={<Bike className="h-5 w-5" />}
              subtext="Activities type: Ride"
            />
            <StatCard
              title="Total Distance"
              value={stats.totalDistanceMiles.toFixed(1)}
              unit="mi"
              icon={<Navigation className="h-5 w-5" />}
              highlight
              subtext="converted from meters"
            />
            <StatCard
              title="Total Elevation"
              value={Math.round(stats.totalElevationFeet).toLocaleString()}
              unit="ft"
              icon={<Mountain className="h-5 w-5" />}
              subtext="converted from meters"
            />
            <StatCard
              title="Moving Time"
              value={formatDuration(stats.totalMovingTimeSeconds)}
              icon={<Clock className="h-5 w-5" />}
              subtext="in saddle time"
            />
            <StatCard
              title="Avg Speed"
              value={stats.avgSpeedMph.toFixed(1)}
              unit="mph"
              icon={<Gauge className="h-5 w-5" />}
              subtext="overall weighted avg"
            />
          </div>
        </section>

        {/* Activity Ride Table & Export Controls */}
        <section className="space-y-4">
          <ActivityTable activities={activities} />
        </section>

        {/* Segment Effort Viewer */}
        <section className="space-y-4">
          <SegmentViewer isDemo={isDemo} accessToken={accessToken} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-orange-500" />
            <span>
              Strava Sheets MVP &bull; Export data to Google Sheets (`raw_data` & `segment_effort_data`)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.strava.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              Strava API V3
            </a>
            <span>&bull;</span>
            <span className="text-zinc-400 font-mono">App Router Next.js 14</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
