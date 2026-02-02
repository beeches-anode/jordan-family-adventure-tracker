import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';
import { CommentsProvider, useComments } from '../context/CommentsContext';

// --- Controllable Firebase mocks ---

let onSnapshotCallback: ((snapshot: unknown) => void) | null = null;
let onSnapshotErrorCallback: ((err: unknown) => void) | null = null;
const mockUnsubscribe = vi.fn();

const mockGetDocsFromServer = vi.fn(() => Promise.resolve({ docs: [] }));

vi.mock('../firebase-config', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
  deleteDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((_q: unknown, _opts: unknown, onNext: unknown, onError: unknown) => {
    onSnapshotCallback = onNext as (snapshot: unknown) => void;
    onSnapshotErrorCallback = onError as (err: unknown) => void;
    return mockUnsubscribe;
  }),
  getDocsFromServer: () => mockGetDocsFromServer(),
  serverTimestamp: vi.fn(() => new Date()),
}));

// --- Test consumer component ---

const TestConsumer: React.FC = () => {
  const ctx = useComments();
  return (
    <div>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="isFromCache">{String(ctx.isFromCache)}</span>
      <span data-testid="isRefreshing">{String(ctx.isRefreshing)}</span>
      <span data-testid="refreshError">{ctx.refreshError || 'none'}</span>
      <span data-testid="hasPendingWrites">{String(ctx.hasPendingWrites)}</span>
      <span data-testid="lastSynced">{ctx.lastSynced ? 'set' : 'null'}</span>
      <span data-testid="commentCount">{ctx.comments.length}</span>
      <button data-testid="refresh" onClick={ctx.refreshComments}>Refresh</button>
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <CommentsProvider>
      <TestConsumer />
    </CommentsProvider>
  );
};

// Helper to fire a snapshot event
const fireSnapshot = (docs: unknown[], fromCache: boolean, hasPendingWrites = false) => {
  act(() => {
    onSnapshotCallback?.({
      docs,
      metadata: { fromCache, hasPendingWrites },
    });
  });
};

const makeDoc = (id: string, data: Record<string, unknown>) => ({
  id,
  data: () => data,
});

describe('CommentsContext — sync behavior', () => {
  beforeEach(() => {
    onSnapshotCallback = null;
    onSnapshotErrorCallback = null;
    mockUnsubscribe.mockClear();
    mockGetDocsFromServer.mockReset();
    mockGetDocsFromServer.mockResolvedValue({ docs: [] });
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- onSnapshot metadata handling ---

  it('sets isFromCache=false and lastSynced when onSnapshot delivers server-confirmed data', () => {
    renderWithProvider();

    fireSnapshot([], false);

    expect(screen.getByTestId('isFromCache')).toHaveTextContent('false');
    expect(screen.getByTestId('lastSynced')).toHaveTextContent('set');
  });

  it('sets isFromCache=true when onSnapshot delivers cached data', () => {
    renderWithProvider();

    fireSnapshot([], true);

    expect(screen.getByTestId('isFromCache')).toHaveTextContent('true');
    expect(screen.getByTestId('lastSynced')).toHaveTextContent('null');
  });

  it('tracks hasPendingWrites from snapshot metadata', () => {
    renderWithProvider();

    fireSnapshot([], true, true);

    expect(screen.getByTestId('hasPendingWrites')).toHaveTextContent('true');
  });

  // --- Server-confirmation gate ---

  it('blocks cached onSnapshot updates while gate is active after refreshComments', async () => {
    const serverDocs = [
      makeDoc('c1', { noteId: 'n1', author: 'Grandma', content: 'Server data', createdAt: { toDate: () => new Date() } }),
    ];
    mockGetDocsFromServer.mockResolvedValue({ docs: serverDocs });

    renderWithProvider();

    // Initial server-confirmed snapshot
    fireSnapshot([], false);

    // Trigger refresh — activates gate and fetches from server
    await act(async () => {
      screen.getByTestId('refresh').click();
    });

    expect(screen.getByTestId('commentCount')).toHaveTextContent('1');

    // Now fire a cached onSnapshot — should be blocked by the gate
    const staleDocs = [
      makeDoc('c-stale', { noteId: 'n1', author: 'Stale', content: 'Stale cached data', createdAt: { toDate: () => new Date() } }),
      makeDoc('c-stale2', { noteId: 'n1', author: 'Stale2', content: 'More stale', createdAt: { toDate: () => new Date() } }),
    ];
    fireSnapshot(staleDocs, true);

    // Should still show 1 comment from server, not 2 from stale cache
    expect(screen.getByTestId('commentCount')).toHaveTextContent('1');
  });

  it('clears gate when onSnapshot delivers server-confirmed data after refresh', async () => {
    mockGetDocsFromServer.mockResolvedValue({ docs: [] });

    renderWithProvider();

    // Trigger refresh
    await act(async () => {
      screen.getByTestId('refresh').click();
    });

    // Fire cached snapshot (blocked by gate)
    fireSnapshot([makeDoc('c1', { noteId: 'n1', author: 'A', content: 'cached', createdAt: { toDate: () => new Date() } })], true);
    expect(screen.getByTestId('commentCount')).toHaveTextContent('0');

    // Fire server-confirmed snapshot — clears gate
    const serverDocs = [
      makeDoc('c2', { noteId: 'n1', author: 'B', content: 'fresh', createdAt: { toDate: () => new Date() } }),
    ];
    fireSnapshot(serverDocs, false);

    expect(screen.getByTestId('commentCount')).toHaveTextContent('1');
    expect(screen.getByTestId('isFromCache')).toHaveTextContent('false');
  });

  // --- refreshComments ---

  it('calls getDocsFromServer when refreshComments is triggered', async () => {
    renderWithProvider();

    // Initial snapshot to get past loading
    fireSnapshot([], false);

    await act(async () => {
      screen.getByTestId('refresh').click();
    });

    expect(mockGetDocsFromServer).toHaveBeenCalled();
  });

  it('sets isRefreshing=true during refresh and false after', async () => {
    let resolveServer: (value: unknown) => void;
    mockGetDocsFromServer.mockImplementation(() =>
      new Promise((resolve) => { resolveServer = resolve; })
    );

    renderWithProvider();
    fireSnapshot([], false);

    // Start refresh (don't await)
    let refreshPromise: Promise<void>;
    act(() => {
      refreshPromise = (screen.getByTestId('refresh') as HTMLButtonElement).click() as unknown as Promise<void>;
    });

    // isRefreshing should be true during the fetch
    expect(screen.getByTestId('isRefreshing')).toHaveTextContent('true');

    // Resolve the server fetch
    await act(async () => {
      resolveServer!({ docs: [] });
    });

    await waitFor(() => {
      expect(screen.getByTestId('isRefreshing')).toHaveTextContent('false');
    });
  });

  it('retries once after initial failure then succeeds', async () => {
    mockGetDocsFromServer
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        docs: [makeDoc('c1', { noteId: 'n1', author: 'A', content: 'retried', createdAt: { toDate: () => new Date() } })],
      });

    renderWithProvider();
    fireSnapshot([], false);

    await act(async () => {
      screen.getByTestId('refresh').click();
      // Advance past the 2-second retry delay
      await vi.advanceTimersByTimeAsync(2_500);
    });

    await waitFor(() => {
      expect(screen.getByTestId('commentCount')).toHaveTextContent('1');
      expect(screen.getByTestId('refreshError')).toHaveTextContent('none');
    });
    expect(mockGetDocsFromServer).toHaveBeenCalledTimes(2);
  });

  it('sets refreshError when both attempts fail and clears gate', async () => {
    mockGetDocsFromServer
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'));

    renderWithProvider();
    fireSnapshot([], false);

    await act(async () => {
      screen.getByTestId('refresh').click();
      await vi.advanceTimersByTimeAsync(3_000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('refreshError')).not.toHaveTextContent('none');
      expect(screen.getByTestId('isRefreshing')).toHaveTextContent('false');
    });

    // Gate should be cleared — cached snapshots should now update
    fireSnapshot([makeDoc('c1', { noteId: 'n1', author: 'A', content: 'cached ok', createdAt: { toDate: () => new Date() } })], true);
    expect(screen.getByTestId('commentCount')).toHaveTextContent('1');
  });

  // --- Visibility-change handler ---

  it('triggers refreshComments on visibility change after 1.5s delay', async () => {
    renderWithProvider();
    fireSnapshot([], false);
    mockGetDocsFromServer.mockClear();

    // Advance past the 30-second throttle window so refreshComments isn't throttled
    await act(async () => {
      await vi.advanceTimersByTimeAsync(31_000);
    });

    // Simulate tab becoming visible
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Should not have refreshed yet (1.5s delay)
    expect(mockGetDocsFromServer).not.toHaveBeenCalled();

    // Advance past 1.5s
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });

    expect(mockGetDocsFromServer).toHaveBeenCalled();
  });

  it('throttles visibility-change refresh to 30-second intervals', async () => {
    renderWithProvider();
    // Fire server-confirmed data to set lastSynced to now
    fireSnapshot([], false);
    mockGetDocsFromServer.mockClear();

    // Simulate tab visible — should be throttled since lastSynced is very recent
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });

    // Should NOT have called refresh because lastSynced was just set
    expect(mockGetDocsFromServer).not.toHaveBeenCalled();
  });

  // --- Cleanup ---

  it('unsubscribes from onSnapshot on unmount', () => {
    const { unmount } = renderWithProvider();

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
