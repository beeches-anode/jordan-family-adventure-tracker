import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { DayWeather } from '../types';
import {
  fetchWeatherForDate,
  shouldRefreshWeather,
  getAllTripDates,
  isDateInPast,
  getLocationForDate,
} from '../utils/weatherService';

interface WeatherContextType {
  weather: Map<string, DayWeather>;
  getWeatherForDate: (date: string) => DayWeather | undefined;
  loading: boolean;
  isOnline: boolean;
  lastUpdated: Date | null;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};

interface WeatherProviderProps {
  children: ReactNode;
  currentDate: Date; // The simulated current date
}

export const WeatherProvider: React.FC<WeatherProviderProps> = ({ children, currentDate }) => {
  const [weather, setWeather] = useState<Map<string, DayWeather>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load weather data from Firestore with real-time sync
  useEffect(() => {
    const weatherRef = collection(db, 'weather');

    const unsubscribe = onSnapshot(
      weatherRef,
      (snapshot) => {
        const weatherData = new Map<string, DayWeather>();
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          weatherData.set(doc.id, {
            id: doc.id,
            date: data.date,
            location: data.location,
            lat: data.lat,
            lng: data.lng,
            tempMax: data.tempMax,
            tempMin: data.tempMin,
            precipitationChance: data.precipitationChance,
            weatherCode: data.weatherCode,
            weatherDescription: data.weatherDescription,
            fetchedAt: data.fetchedAt?.toDate() || new Date(),
            isHistorical: data.isHistorical,
          });
        });
        setWeather(weatherData);
        setLoading(false);
        setHasInitialized(true);
      },
      (error) => {
        console.error('Error loading weather from Firestore:', error);
        setLoading(false);
        setHasInitialized(true);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save weather to Firestore
  const saveWeatherToFirestore = useCallback(async (weatherData: DayWeather) => {
    try {
      const weatherRef = doc(db, 'weather', weatherData.date);
      await setDoc(weatherRef, {
        date: weatherData.date,
        location: weatherData.location,
        lat: weatherData.lat,
        lng: weatherData.lng,
        tempMax: weatherData.tempMax,
        tempMin: weatherData.tempMin,
        precipitationChance: weatherData.precipitationChance,
        weatherCode: weatherData.weatherCode,
        weatherDescription: weatherData.weatherDescription,
        fetchedAt: Timestamp.fromDate(weatherData.fetchedAt),
        isHistorical: weatherData.isHistorical,
      });
    } catch (error) {
      console.error('Error saving weather to Firestore:', error);
    }
  }, []);

  // Fetch and update weather for all trip dates
  const refreshAllWeather = useCallback(async () => {
    if (!isOnline) return;

    const tripDates = getAllTripDates();
    const updates: Promise<void>[] = [];

    for (const date of tripDates) {
      // Skip "In Transit" day
      const locationInfo = getLocationForDate(new Date(date));
      if (locationInfo.location === 'In Transit') continue;

      const existingWeather = weather.get(date);

      // Determine if we need to fetch
      let shouldFetch = false;

      if (!existingWeather) {
        // No data exists, fetch it
        shouldFetch = true;
      } else if (shouldRefreshWeather(existingWeather, currentDate)) {
        // Data is stale, refresh it
        shouldFetch = true;
      } else if (!existingWeather.isHistorical && isDateInPast(date, currentDate)) {
        // Day has passed but wasn't marked as historical, update it
        shouldFetch = true;
      }

      if (shouldFetch) {
        updates.push(
          (async () => {
            const newWeather = await fetchWeatherForDate(date, currentDate);
            if (newWeather) {
              await saveWeatherToFirestore(newWeather);
            }
          })()
        );
      }
    }

    if (updates.length > 0) {
      await Promise.allSettled(updates);
      setLastUpdated(new Date());
    }
  }, [isOnline, weather, currentDate, saveWeatherToFirestore]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    if (!hasInitialized || !isOnline) return;

    // Initial fetch
    refreshAllWeather();

    // Set up periodic refresh (every 30 minutes while online)
    const refreshInterval = setInterval(() => {
      if (navigator.onLine) {
        refreshAllWeather();
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(refreshInterval);
  }, [hasInitialized, isOnline, refreshAllWeather]);

  // Refresh when coming back online
  useEffect(() => {
    if (isOnline && hasInitialized) {
      refreshAllWeather();
    }
  }, [isOnline, hasInitialized, refreshAllWeather]);

  const getWeatherForDate = useCallback((date: string): DayWeather | undefined => {
    return weather.get(date);
  }, [weather]);

  return (
    <WeatherContext.Provider value={{ weather, getWeatherForDate, loading, isOnline, lastUpdated }}>
      {children}
    </WeatherContext.Provider>
  );
};
