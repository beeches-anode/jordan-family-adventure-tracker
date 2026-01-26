import { DayWeather } from '../types';

// Location data for each day of the trip
// Derived from DayDeepDive.tsx coordinates
interface LocationInfo {
  lat: number;
  lng: number;
  location: string;
  timezone: string;
}

// Get location info for a given date
export const getLocationForDate = (date: Date): LocationInfo => {
  const d = date.getDate();
  const m = date.getMonth(); // 0 = Jan, 1 = Feb

  // January locations
  if (m === 0) {
    if (d === 23 || d === 24) return { lat: -12.115, lng: -77.042, location: 'Lima, Peru', timezone: 'America/Lima' };
    if (d === 25) return { lat: -13.522, lng: -71.967, location: 'Cusco, Peru', timezone: 'America/Lima' };
    // Inca Trail Day 1: Km 82 (2650m) → Llaqtapata → Wayllabamba (3000m)
    if (d === 26) return { lat: -13.250, lng: -72.458, location: 'Wayllabamba, Inca Trail', timezone: 'America/Lima' };
    // Inca Trail Day 2: Wayllabamba → Dead Woman's Pass (4215m) → Pacaymayo
    if (d === 27) return { lat: -13.208, lng: -72.492, location: 'Warmiwañusqa Pass, Inca Trail', timezone: 'America/Lima' };
    // Inca Trail Day 3: Runkurakay → Phuyupatamarka (3600m) → Wiñaywayna (2650m)
    if (d === 28) return { lat: -13.175, lng: -72.525, location: 'Phuyupatamarka, Inca Trail', timezone: 'America/Lima' };
    // Inca Trail Day 4: Wiñaywayna → Inti Punku (Sun Gate) → Machu Picchu (2430m)
    if (d === 29) return { lat: -13.163, lng: -72.545, location: 'Machu Picchu, Peru', timezone: 'America/Lima' };
    if (d === 30) return { lat: -12.593, lng: -69.186, location: 'Puerto Maldonado, Peru', timezone: 'America/Lima' };
    if (d === 31) return { lat: -12.8, lng: -69.3, location: 'Amazon Jungle, Peru', timezone: 'America/Lima' };
  }

  // February locations
  if (m === 1) {
    if (d === 1) return { lat: -12.85, lng: -69.25, location: 'Amazon Jungle, Peru', timezone: 'America/Lima' };
    if (d === 2 || d === 3) return { lat: -34.603, lng: -58.381, location: 'Buenos Aires, Argentina', timezone: 'America/Argentina/Buenos_Aires' };
    if (d === 4) return { lat: -49.333, lng: -72.883, location: 'El Chaltén, Argentina', timezone: 'America/Argentina/Buenos_Aires' };
    if (d === 5) return { lat: -49.34, lng: -72.93, location: 'El Chaltén, Argentina', timezone: 'America/Argentina/Buenos_Aires' };
    if (d === 6) return { lat: -49.27, lng: -72.98, location: 'El Chaltén, Argentina', timezone: 'America/Argentina/Buenos_Aires' };
    if (d === 7) return { lat: -49.37, lng: -72.85, location: 'El Chaltén, Argentina', timezone: 'America/Argentina/Buenos_Aires' };
    if (d === 8) return { lat: -50.33, lng: -72.26, location: 'El Calafate, Argentina', timezone: 'America/Argentina/Buenos_Aires' };
    if (d === 9) return { lat: -50.47, lng: -73.04, location: 'Perito Moreno, Argentina', timezone: 'America/Argentina/Buenos_Aires' };
    if (d === 10) return { lat: -50.32, lng: -72.28, location: 'El Calafate, Argentina', timezone: 'America/Argentina/Buenos_Aires' };
    if (d === 11) return { lat: -34.558, lng: -58.416, location: 'Buenos Aires, Argentina', timezone: 'America/Argentina/Buenos_Aires' };
    if (d === 12) return { lat: -34.634, lng: -58.363, location: 'Buenos Aires, Argentina', timezone: 'America/Argentina/Buenos_Aires' };
    if (d === 13) return { lat: -34.558, lng: -58.416, location: 'Buenos Aires, Argentina', timezone: 'America/Argentina/Buenos_Aires' };
    if (d === 14) return { lat: -30, lng: -140, location: 'In Transit', timezone: 'Pacific/Auckland' };
    if (d === 15) return { lat: -27.470, lng: 153.026, location: 'Brisbane, Australia', timezone: 'Australia/Brisbane' };
  }

  // Default fallback
  return { lat: -15, lng: -60, location: 'South America', timezone: 'America/Lima' };
};

// WMO Weather interpretation codes
// https://open-meteo.com/en/docs
export const getWeatherDescription = (code: number): string => {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
};

// Get weather icon based on WMO code
export const getWeatherIcon = (code: number): string => {
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌧️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 85 && code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌡️';
};

// Determine if weather data should be refreshed
export const shouldRefreshWeather = (
  weather: DayWeather,
  currentDate: Date
): boolean => {
  // Historical data never needs refresh
  if (weather.isHistorical) return false;

  const weatherDate = new Date(weather.date);
  const hoursSinceFetch = (Date.now() - weather.fetchedAt.getTime()) / (1000 * 60 * 60);

  // Normalize dates for comparison (remove time component)
  const weatherDateStr = weather.date;
  const currentDateStr = currentDate.toISOString().split('T')[0];

  // Past days: should not refresh (but mark as historical if not already)
  if (weatherDateStr < currentDateStr) return false;

  // Today: refresh every 6 hours
  if (weatherDateStr === currentDateStr) {
    return hoursSinceFetch > 6;
  }

  // Future days: refresh every 12 hours
  return hoursSinceFetch > 12;
};

// Check if a date is in the past relative to current date
export const isDateInPast = (dateStr: string, currentDate: Date): boolean => {
  const currentDateStr = currentDate.toISOString().split('T')[0];
  return dateStr < currentDateStr;
};

// Fetch forecast weather from Open-Meteo
export const fetchForecastWeather = async (
  date: string,
  lat: number,
  lng: number,
  timezone: string
): Promise<Partial<DayWeather> | null> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=${encodeURIComponent(timezone)}&start_date=${date}&end_date=${date}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Forecast API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      console.error('No forecast data returned');
      return null;
    }

    const weatherCode = data.daily.weather_code[0];

    return {
      tempMax: Math.round(data.daily.temperature_2m_max[0]),
      tempMin: Math.round(data.daily.temperature_2m_min[0]),
      precipitationChance: data.daily.precipitation_probability_max[0] || 0,
      weatherCode,
      weatherDescription: getWeatherDescription(weatherCode),
    };
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return null;
  }
};

// Fetch historical weather from Open-Meteo Archive API
export const fetchHistoricalWeather = async (
  date: string,
  lat: number,
  lng: number,
  timezone: string
): Promise<Partial<DayWeather> | null> => {
  try {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=${encodeURIComponent(timezone)}&start_date=${date}&end_date=${date}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Historical API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      console.error('No historical data returned');
      return null;
    }

    const weatherCode = data.daily.weather_code[0];
    // Historical API doesn't have precipitation_probability, estimate from precipitation_sum
    const precipSum = data.daily.precipitation_sum[0] || 0;
    const precipChance = precipSum > 0 ? Math.min(100, Math.round(precipSum * 10)) : 0;

    return {
      tempMax: Math.round(data.daily.temperature_2m_max[0]),
      tempMin: Math.round(data.daily.temperature_2m_min[0]),
      precipitationChance: precipChance,
      weatherCode,
      weatherDescription: getWeatherDescription(weatherCode),
    };
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    return null;
  }
};

// Fetch weather for a specific date (chooses forecast or historical based on date)
export const fetchWeatherForDate = async (
  date: string,
  currentDate: Date
): Promise<DayWeather | null> => {
  const dateObj = new Date(date);
  const locationInfo = getLocationForDate(dateObj);

  // Skip "In Transit" day - no meaningful weather to show
  if (locationInfo.location === 'In Transit') {
    return null;
  }

  const isPast = isDateInPast(date, currentDate);

  let weatherData: Partial<DayWeather> | null;

  if (isPast) {
    weatherData = await fetchHistoricalWeather(
      date,
      locationInfo.lat,
      locationInfo.lng,
      locationInfo.timezone
    );
  } else {
    weatherData = await fetchForecastWeather(
      date,
      locationInfo.lat,
      locationInfo.lng,
      locationInfo.timezone
    );
  }

  if (!weatherData) return null;

  return {
    date,
    location: locationInfo.location,
    lat: locationInfo.lat,
    lng: locationInfo.lng,
    tempMax: weatherData.tempMax!,
    tempMin: weatherData.tempMin!,
    precipitationChance: weatherData.precipitationChance!,
    weatherCode: weatherData.weatherCode!,
    weatherDescription: weatherData.weatherDescription!,
    fetchedAt: new Date(),
    isHistorical: isPast,
  };
};

// Generate all trip dates
export const getAllTripDates = (): string[] => {
  const dates: string[] = [];
  const start = new Date('2026-01-23');
  const end = new Date('2026-02-15');

  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};
