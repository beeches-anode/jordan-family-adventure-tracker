import React, { useState, useEffect, useCallback } from 'react';
import { useNotes } from '../context/NotesContext';
import { useComments } from '../context/CommentsContext';
import { useWeather } from '../context/WeatherContext';

export const SyncStatusBar: React.FC = () => {
  const {
    refreshNotes,
    lastSynced: notesLastSynced,
    isFromCache: notesFromCache,
    isRefreshing: notesRefreshing,
    refreshError: notesRefreshError,
    hasPendingWrites: notesPendingWrites,
  } = useNotes();
  const {
    refreshComments,
    lastSynced: commentsLastSynced,
    isFromCache: commentsFromCache,
    isRefreshing: commentsRefreshing,
    refreshError: commentsRefreshError,
    hasPendingWrites: commentsPendingWrites,
  } = useComments();
  const {
    refreshWeather,
    isRefreshing: weatherRefreshing,
    refreshError: weatherRefreshError,
  } = useWeather();

  const [timeAgo, setTimeAgo] = useState<string>('');

  // Aggregate state across all contexts
  const isRefreshing = notesRefreshing || commentsRefreshing || weatherRefreshing;
  const refreshError = notesRefreshError || commentsRefreshError || weatherRefreshError;
  const isFromCache = notesFromCache || commentsFromCache;
  const hasPendingWrites = notesPendingWrites || commentsPendingWrites;

  // lastSynced = the oldest (minimum) non-null timestamp, showing worst-case staleness
  const lastSynced = [notesLastSynced, commentsLastSynced]
    .filter((d): d is Date => d !== null)
    .reduce<Date | null>((oldest, d) => (!oldest || d < oldest ? d : oldest), null);

  const handleRefresh = useCallback(async () => {
    await Promise.allSettled([refreshNotes(), refreshComments(), refreshWeather()]);
  }, [refreshNotes, refreshComments, refreshWeather]);

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastSynced) {
        setTimeAgo('Never');
        return;
      }
      const seconds = Math.floor((Date.now() - lastSynced.getTime()) / 1000);
      if (seconds < 10) setTimeAgo('Just now');
      else if (seconds < 60) setTimeAgo(`${seconds}s ago`);
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      else setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 15_000);
    return () => clearInterval(interval);
  }, [lastSynced]);

  // Determine status dot color and label
  const hasEverSynced = lastSynced !== null;
  let dotClass = 'bg-emerald-400';
  let statusLabel = `Synced: ${timeAgo}`;

  if (refreshError && !hasEverSynced) {
    // Never synced and refresh failed — genuine error
    dotClass = 'bg-red-400';
    statusLabel = 'Refresh failed';
  } else if (refreshError && hasEverSynced) {
    // Had a successful sync before but refresh just failed — transient error on iOS,
    // downgrade to amber since we still have usable (cached) data.
    dotClass = 'bg-amber-400';
    statusLabel = `Cached: ${timeAgo}`;
  } else if (!hasEverSynced && isFromCache) {
    // Initial load — Firestore WebSocket hasn't connected yet (common on iOS).
    // Show neutral connecting state instead of alarming amber "Cached: Never".
    dotClass = 'bg-indigo-400 animate-pulse';
    statusLabel = 'Connecting...';
  } else if (isFromCache && hasPendingWrites) {
    dotClass = 'bg-amber-400 animate-pulse';
    statusLabel = 'Syncing changes...';
  } else if (isFromCache) {
    dotClass = 'bg-amber-400';
    statusLabel = `Cached: ${timeAgo}`;
  }

  return (
    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`}
        title={refreshError ? (hasEverSynced ? 'Showing cached data (refresh failed)' : refreshError) : (!hasEverSynced && isFromCache) ? 'Connecting to server...' : hasPendingWrites ? 'Local changes syncing to server' : isFromCache ? 'Showing cached data' : 'Synced with server'}
      />
      <span className={`whitespace-nowrap hidden sm:inline ${(refreshError && !hasEverSynced) ? 'text-red-300' : 'text-indigo-200'}`}>
        {statusLabel}
      </span>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
        title="Refresh from server"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-white ${isRefreshing ? 'animate-spin' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
};
