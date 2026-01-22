
export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface TripEvent {
  date: string;
  location: string;
  activity: string;
  description: string;
}

export interface TripState {
  currentSimulatedDate: Date;
  location: string;
  currentActivity: string;
}

export interface Photo {
  url: string;
  path: string;        // Storage path for potential deletion
  width: number;
  height: number;
}

export interface Note {
  id: string;
  author: 'Harry' | 'Trent';
  content: string;
  date: string;        // ISO: "2026-01-25"
  createdAt: Date;
  location?: string;
  timezone?: string;   // IANA timezone e.g., "America/Lima"
  photos?: Photo[];    // Optional array of photos
}

export interface DayWeather {
  id?: string;
  date: string;                    // ISO: "2026-01-25"
  location: string;                // "Lima, Peru"
  lat: number;
  lng: number;
  tempMax: number;                 // Celsius
  tempMin: number;                 // Celsius
  precipitationChance: number;     // 0-100 percentage
  weatherCode: number;             // WMO weather code
  weatherDescription: string;      // "Partly cloudy"
  fetchedAt: Date;                 // When this data was fetched
  isHistorical: boolean;           // true = past day, locked in forever
}
