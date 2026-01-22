import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { getWeatherIcon } from '../utils/weatherService';

interface WeatherDisplayProps {
  date: string; // ISO date string: "2026-01-25"
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ date }) => {
  const { getWeatherForDate, loading, isOnline } = useWeather();
  const weather = getWeatherForDate(date);

  // Skip rendering for "In Transit" day (Feb 14)
  if (date === '2026-02-14') {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-start gap-3 animate-pulse">
        <span className="text-xl">🌡️</span>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Weather</p>
          <div className="h-4 w-24 bg-slate-200 rounded mt-1"></div>
          <div className="h-3 w-32 bg-slate-100 rounded mt-2"></div>
        </div>
      </div>
    );
  }

  // No weather data yet
  if (!weather) {
    return (
      <div className="flex items-start gap-3">
        <span className="text-xl">🌡️</span>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Weather</p>
          <p className="text-sm text-slate-500 italic">
            {isOnline ? 'Loading forecast...' : 'Offline - no cached data'}
          </p>
        </div>
      </div>
    );
  }

  const icon = getWeatherIcon(weather.weatherCode);
  const isHistorical = weather.isHistorical;

  return (
    <div className="flex items-start gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-[10px] uppercase font-bold text-slate-400">Weather</p>
          {isHistorical && (
            <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              Recorded
            </span>
          )}
          {!isOnline && !isHistorical && (
            <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
              Cached
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-700">{weather.weatherDescription}</p>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold text-slate-600">{weather.tempMax}°C</span>
          </div>
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold text-slate-600">{weather.tempMin}°C</span>
          </div>
          {weather.precipitationChance > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs">💧</span>
              <span className="text-xs font-bold text-blue-600">{weather.precipitationChance}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
