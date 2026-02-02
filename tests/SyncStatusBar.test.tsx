import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SyncStatusBar } from '../components/SyncStatusBar';

// --- Mutable mock values ---

let mockNotesContext: Record<string, unknown> = {};
let mockCommentsContext: Record<string, unknown> = {};
let mockWeatherContext: Record<string, unknown> = {};

vi.mock('../context/NotesContext', () => ({
  useNotes: () => mockNotesContext,
}));

vi.mock('../context/CommentsContext', () => ({
  useComments: () => mockCommentsContext,
}));

vi.mock('../context/WeatherContext', () => ({
  useWeather: () => mockWeatherContext,
}));

const createDefaultNotesContext = (overrides: Record<string, unknown> = {}) => ({
  refreshNotes: vi.fn(() => Promise.resolve()),
  lastSynced: new Date(),
  isFromCache: false,
  isRefreshing: false,
  refreshError: null,
  hasPendingWrites: false,
  ...overrides,
});

const createDefaultCommentsContext = (overrides: Record<string, unknown> = {}) => ({
  refreshComments: vi.fn(() => Promise.resolve()),
  lastSynced: new Date(),
  isFromCache: false,
  isRefreshing: false,
  refreshError: null,
  hasPendingWrites: false,
  ...overrides,
});

const createDefaultWeatherContext = (overrides: Record<string, unknown> = {}) => ({
  refreshWeather: vi.fn(() => Promise.resolve()),
  isRefreshing: false,
  refreshError: null,
  ...overrides,
});

describe('SyncStatusBar', () => {
  beforeEach(() => {
    mockNotesContext = createDefaultNotesContext();
    mockCommentsContext = createDefaultCommentsContext();
    mockWeatherContext = createDefaultWeatherContext();
  });

  // --- Status display ---

  it('shows green dot and "Synced" when all contexts are synced', () => {
    render(<SyncStatusBar />);

    const dot = screen.getByTitle('Synced with server');
    expect(dot).toBeInTheDocument();
    expect(dot.className).toContain('bg-emerald-400');
    expect(screen.getByText(/Synced:/)).toBeInTheDocument();
  });

  it('shows amber dot and "Cached" when notes are from cache', () => {
    mockNotesContext = createDefaultNotesContext({ isFromCache: true });

    render(<SyncStatusBar />);

    const dot = screen.getByTitle('Showing cached data');
    expect(dot).toBeInTheDocument();
    expect(dot.className).toContain('bg-amber-400');
    expect(screen.getByText(/Cached:/)).toBeInTheDocument();
  });

  it('shows amber dot and "Cached" when comments are from cache (even if notes are synced)', () => {
    mockCommentsContext = createDefaultCommentsContext({ isFromCache: true });

    render(<SyncStatusBar />);

    const dot = screen.getByTitle('Showing cached data');
    expect(dot.className).toContain('bg-amber-400');
    expect(screen.getByText(/Cached:/)).toBeInTheDocument();
  });

  it('shows pulsing amber dot and "Syncing changes..." when pending writes exist', () => {
    mockNotesContext = createDefaultNotesContext({ isFromCache: true, hasPendingWrites: true });

    render(<SyncStatusBar />);

    const dot = screen.getByTitle('Local changes syncing to server');
    expect(dot.className).toContain('bg-amber-400');
    expect(dot.className).toContain('animate-pulse');
    expect(screen.getByText('Syncing changes...')).toBeInTheDocument();
  });

  it('shows pulsing amber dot when comments have pending writes (even if notes do not)', () => {
    mockCommentsContext = createDefaultCommentsContext({ isFromCache: true, hasPendingWrites: true });

    render(<SyncStatusBar />);

    const dot = screen.getByTitle('Local changes syncing to server');
    expect(dot.className).toContain('animate-pulse');
    expect(screen.getByText('Syncing changes...')).toBeInTheDocument();
  });

  it('shows red dot and "Refresh failed" when notes have a refresh error', () => {
    mockNotesContext = createDefaultNotesContext({ refreshError: 'Notes fetch failed' });

    render(<SyncStatusBar />);

    const dot = screen.getByTitle('Notes fetch failed');
    expect(dot.className).toContain('bg-red-400');
    expect(screen.getByText('Refresh failed')).toBeInTheDocument();
  });

  it('shows red dot and "Refresh failed" when comments have a refresh error', () => {
    mockCommentsContext = createDefaultCommentsContext({ refreshError: 'Comments fetch failed' });

    render(<SyncStatusBar />);

    const dot = screen.getByTitle('Comments fetch failed');
    expect(dot.className).toContain('bg-red-400');
    expect(screen.getByText('Refresh failed')).toBeInTheDocument();
  });

  it('shows red dot and "Refresh failed" when weather has a refresh error', () => {
    mockWeatherContext = createDefaultWeatherContext({ refreshError: 'Weather fetch failed' });

    render(<SyncStatusBar />);

    const dot = screen.getByTitle('Weather fetch failed');
    expect(dot.className).toContain('bg-red-400');
    expect(screen.getByText('Refresh failed')).toBeInTheDocument();
  });

  it('error state takes priority over cached state', () => {
    mockNotesContext = createDefaultNotesContext({ isFromCache: true });
    mockCommentsContext = createDefaultCommentsContext({ refreshError: 'Connection lost' });

    render(<SyncStatusBar />);

    expect(screen.getByText('Refresh failed')).toBeInTheDocument();
    const dot = screen.getByTitle('Connection lost');
    expect(dot.className).toContain('bg-red-400');
  });

  // --- Refresh button ---

  it('calls all three refresh functions when button is clicked', async () => {
    const user = userEvent.setup();
    const refreshNotes = vi.fn(() => Promise.resolve());
    const refreshComments = vi.fn(() => Promise.resolve());
    const refreshWeather = vi.fn(() => Promise.resolve());

    mockNotesContext = createDefaultNotesContext({ refreshNotes });
    mockCommentsContext = createDefaultCommentsContext({ refreshComments });
    mockWeatherContext = createDefaultWeatherContext({ refreshWeather });

    render(<SyncStatusBar />);

    await user.click(screen.getByTitle('Refresh from server'));

    expect(refreshNotes).toHaveBeenCalledTimes(1);
    expect(refreshComments).toHaveBeenCalledTimes(1);
    expect(refreshWeather).toHaveBeenCalledTimes(1);
  });

  it('disables button when any context is refreshing (notes)', () => {
    mockNotesContext = createDefaultNotesContext({ isRefreshing: true });

    render(<SyncStatusBar />);

    const button = screen.getByTitle('Refresh from server');
    expect(button).toBeDisabled();
  });

  it('disables button when any context is refreshing (comments)', () => {
    mockCommentsContext = createDefaultCommentsContext({ isRefreshing: true });

    render(<SyncStatusBar />);

    const button = screen.getByTitle('Refresh from server');
    expect(button).toBeDisabled();
  });

  it('disables button when any context is refreshing (weather)', () => {
    mockWeatherContext = createDefaultWeatherContext({ isRefreshing: true });

    render(<SyncStatusBar />);

    const button = screen.getByTitle('Refresh from server');
    expect(button).toBeDisabled();
  });

  it('shows spinning icon when refreshing', () => {
    mockNotesContext = createDefaultNotesContext({ isRefreshing: true });

    render(<SyncStatusBar />);

    const svg = screen.getByTitle('Refresh from server').querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('animate-spin');
  });

  it('button is enabled when not refreshing', () => {
    render(<SyncStatusBar />);

    const button = screen.getByTitle('Refresh from server');
    expect(button).not.toBeDisabled();
  });

  // --- Time-ago display ---

  it('shows "Never" when no context has synced yet', () => {
    mockNotesContext = createDefaultNotesContext({ lastSynced: null });
    mockCommentsContext = createDefaultCommentsContext({ lastSynced: null });

    render(<SyncStatusBar />);

    expect(screen.getByText('Synced: Never')).toBeInTheDocument();
  });

  it('shows "Just now" when synced recently', () => {
    const now = new Date();
    mockNotesContext = createDefaultNotesContext({ lastSynced: now });
    mockCommentsContext = createDefaultCommentsContext({ lastSynced: now });

    render(<SyncStatusBar />);

    expect(screen.getByText('Synced: Just now')).toBeInTheDocument();
  });

  it('uses the oldest lastSynced timestamp for time-ago display', () => {
    const staleTime = new Date(Date.now() - 120_000); // 2 minutes ago
    const freshTime = new Date(); // just now
    mockNotesContext = createDefaultNotesContext({ lastSynced: freshTime });
    mockCommentsContext = createDefaultCommentsContext({ lastSynced: staleTime });

    render(<SyncStatusBar />);

    // Should show "2m ago" based on the older comments sync, not "Just now"
    expect(screen.getByText('Synced: 2m ago')).toBeInTheDocument();
  });

  // --- Aggregation correctness ---

  it('shows synced when both notes and comments are from server', () => {
    mockNotesContext = createDefaultNotesContext({ isFromCache: false });
    mockCommentsContext = createDefaultCommentsContext({ isFromCache: false });

    render(<SyncStatusBar />);

    const dot = screen.getByTitle('Synced with server');
    expect(dot.className).toContain('bg-emerald-400');
  });

  it('continues refresh even if one context fails', async () => {
    const user = userEvent.setup();
    const refreshNotes = vi.fn(() => Promise.reject(new Error('fail')));
    const refreshComments = vi.fn(() => Promise.resolve());
    const refreshWeather = vi.fn(() => Promise.resolve());

    mockNotesContext = createDefaultNotesContext({ refreshNotes });
    mockCommentsContext = createDefaultCommentsContext({ refreshComments });
    mockWeatherContext = createDefaultWeatherContext({ refreshWeather });

    render(<SyncStatusBar />);

    await user.click(screen.getByTitle('Refresh from server'));

    // All three should have been called regardless of notes failing
    expect(refreshNotes).toHaveBeenCalledTimes(1);
    expect(refreshComments).toHaveBeenCalledTimes(1);
    expect(refreshWeather).toHaveBeenCalledTimes(1);
  });
});
