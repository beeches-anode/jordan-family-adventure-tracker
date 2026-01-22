
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
