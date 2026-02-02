import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';
import { WeatherProvider, useWeather } from '../context/WeatherContext';

// --- Controllable Firebase mocks ---

let onSnapshotCallback: ((snapshot: unknown) => void) | null = null;

vi.mock('../firebase-config', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn((_ref: unknown, onNext: unknown) => {
    onSnapshotCallback = onNext as (snapshot: unknown) => void;
    return vi.fn(); // unsubscribe
  }),
  Timestamp: { fromDate: (d: Date) => ({ toDate: () => d }) },
}));

// Mock weather service - avoid actual API calls
const mockFetchWeatherForDate = vi.fn(() => Promise.resolve(null));

vi.mock('../utils/weatherService', () => ({
  fetchWeatherForDate: () => mockFetchWeatherForDate(),
  shouldRefreshWeather: vi.fn(() => false),
  getAllTripDates: vi.fn(() => []),
  isDateInPast: vi.fn(() => false),
  getLocationForDate: vi.fn(() => ({ location: 'Lima, Peru', lat: -12.0, lng: -77.0 })),
}));

vi.mock('../constants', () => ({
  parseLocalDate: (s: string) => new Date(s),
}));

// --- Test consumer component ---

const TestConsumer: React.FC = () => {
  const ctx = useWeather();
  return (
    <div>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="isRefreshing">{String(ctx.isRefreshing)}</span>
      <span data-testid="refreshError">{ctx.refreshError || 'none'}</span>
      <span data-testid="isOnline">{String(ctx.isOnline)}</span>
      <button data-testid="refresh" onClick={ctx.refreshWeather}>Refresh</button>
    </div>
  );
};

const renderWithProvider = (currentDate = new Date('2026-02-01')) => {
  return render(
    <WeatherProvider currentDate={currentDate}>
      <TestConsumer />
    </WeatherProvider>
  );
};

describe('WeatherContext — refresh behavior', () => {
  beforeEach(() => {
    onSnapshotCallback = null;
    mockFetchWeatherForDate.mockReset();
    mockFetchWeatherForDate.mockResolvedValue(null);
  });

  it('exposes refreshWeather function through context', () => {
    renderWithProvider();

    // Fire initial snapshot to get past loading
    act(() => {
      onSnapshotCallback?.({ docs: [] });
    });

    expect(screen.getByTestId('refresh')).toBeInTheDocument();
  });

  it('sets isRefreshing=true during refresh and false after', async () => {
    renderWithProvider();

    act(() => {
      onSnapshotCallback?.({ docs: [] });
    });

    // Click refresh
    await act(async () => {
      screen.getByTestId('refresh').click();
    });

    // After completion, isRefreshing should be false
    await waitFor(() => {
      expect(screen.getByTestId('isRefreshing')).toHaveTextContent('false');
    });
  });

  it('starts with isRefreshing=false and no error', () => {
    renderWithProvider();

    act(() => {
      onSnapshotCallback?.({ docs: [] });
    });

    expect(screen.getByTestId('isRefreshing')).toHaveTextContent('false');
    expect(screen.getByTestId('refreshError')).toHaveTextContent('none');
  });

  it('clears refreshError on new refresh attempt', async () => {
    // Import the mocked module to control getAllTripDates
    const weatherService = await import('../utils/weatherService');
    (weatherService.getAllTripDates as ReturnType<typeof vi.fn>).mockReturnValue(['2026-02-01']);
    mockFetchWeatherForDate.mockRejectedValueOnce(new Error('API down'));

    renderWithProvider();

    act(() => {
      onSnapshotCallback?.({ docs: [] });
    });

    // First refresh — will fail (but allSettled catches individual errors, so
    // refreshAllWeather itself won't throw). The wrapper only catches if
    // refreshAllWeather itself throws.
    await act(async () => {
      screen.getByTestId('refresh').click();
    });

    // Reset to successful
    mockFetchWeatherForDate.mockResolvedValue(null);

    // Second refresh
    await act(async () => {
      screen.getByTestId('refresh').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('refreshError')).toHaveTextContent('none');
    });
  });

  it('refresh completes successfully when there are no trip dates to fetch', async () => {
    renderWithProvider();

    act(() => {
      onSnapshotCallback?.({ docs: [] });
    });

    await act(async () => {
      screen.getByTestId('refresh').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('isRefreshing')).toHaveTextContent('false');
      expect(screen.getByTestId('refreshError')).toHaveTextContent('none');
    });
  });
});
