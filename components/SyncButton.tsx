'use client';

import React, { useState } from 'react';
import { RefreshCw, Key, ShieldCheck, Play, Sparkles } from 'lucide-react';

interface SyncButtonProps {
  isDemo: boolean;
  isLoading: boolean;
  onSync: (token?: string) => void;
  onToggleDemo: () => void;
  lastSyncedAt?: string | null;
}

export const SyncButton: React.FC<SyncButtonProps> = ({
  isDemo,
  isLoading,
  onSync,
  onToggleDemo,
  lastSyncedAt,
}) => {
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showTokenInput && tokenInput.trim()) {
      onSync(tokenInput.trim());
      setShowTokenInput(false);
    } else {
      onSync();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Mode Badge */}
      <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium">
        {isDemo ? (
          <>
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 font-semibold">Demo Mode</span>
          </>
        ) : (
          <>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-semibold">Live Strava API</span>
          </>
        )}
      </div>

      {/* Primary Sync Action */}
      <button
        onClick={() => onSync()}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 transition-all"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Syncing...' : 'Sync Rides'}
      </button>

      {/* Mode Switcher */}
      <button
        onClick={onToggleDemo}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-all"
      >
        {isDemo ? (
          <>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Switch to Live API
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Use Demo Mode
          </>
        )}
      </button>

      {/* Token modal / dropdown toggle if not demo */}
      {!isDemo && (
        <div className="relative">
          <button
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all"
          >
            <Key className="h-3.5 w-3.5 text-zinc-400" />
            API Token
          </button>

          {showTokenInput && (
            <form
              onSubmit={handleSyncSubmit}
              className="absolute right-0 top-11 z-20 w-72 rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-xl text-xs"
            >
              <label className="block text-zinc-300 font-semibold mb-1">
                Strava Access Token
              </label>
              <input
                type="password"
                placeholder="Paste Bearer Token..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTokenInput(false)}
                  className="px-2.5 py-1 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-orange-600 px-3 py-1 font-semibold text-white hover:bg-orange-500"
                >
                  Save & Sync
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {lastSyncedAt && (
        <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
          Synced: {lastSyncedAt}
        </span>
      )}
    </div>
  );
};

export default SyncButton;
