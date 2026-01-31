import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';

export const SyncStatusBar: React.FC = () => {
  const { refreshNotes, lastSynced, isFromCache, isRefreshing, refreshError, hasPendingWrites } = useNotes();
  const [timeAgo, setTimeAgo] = useState<string>('');

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
  let dotClass = 'bg-emerald-400';
  let statusLabel = `Synced: ${timeAgo}`;

  if (refreshError) {
    dotClass = 'bg-red-400';
    statusLabel = 'Refresh failed';
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
        title={refreshError || (hasPendingWrites ? 'Local changes syncing to server' : isFromCache ? 'Showing cached data' : 'Synced with server')}
      />
      <span className={`whitespace-nowrap hidden sm:inline ${refreshError ? 'text-red-300' : 'text-indigo-200'}`}>
        {statusLabel}
      </span>
      <button
        onClick={refreshNotes}
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
