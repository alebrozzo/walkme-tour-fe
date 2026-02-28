export type StopType =
  | 'landmark'
  | 'museum'
  | 'neighborhood'
  | 'temple'
  | 'shrine'
  | 'park'
  | 'piazza'
  | 'market'
  | 'beach';

export type Difficulty = 'easy' | 'moderate' | 'hard';

export interface Stop {
  id: string;
  order: number;
  name: string;
  address: string;
  type: StopType;
  description: string;
  duration: number;
  tips?: string;
}

export interface Tour {
  id: string;
  city: string;
  country: string;
  description: string;
  duration: number;
  distance: number;
  difficulty: Difficulty;
  color: string;
  stops: Stop[];
}

export interface TripPreferences {
  days: number;
  hoursPerDay: number;
}

export interface GeneratedItinerary {
  tourId: string;
  preferences: TripPreferences;
  stops: Stop[];
}

export type RootStackParamList = {
  Home: undefined;
  Tour: { tour: Tour };
  Stop: { stop: Stop; tourColor: string };
};
