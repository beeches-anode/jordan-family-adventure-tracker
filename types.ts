
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
