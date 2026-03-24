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

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Stop {
  id: string;
  order: number;
  name: string;
  address: string;
  coordinate: Coordinate;
  type: StopType;
  /** Optional remote image URL shown in stop cards/details when available. */
  imageUrl?: string;
  description: string;
  duration: number;
  tips?: string;
  /** Walking time in minutes to reach the next stop. Omitted for the last stop. */
  walkingTime?: number;
  /** Entry price as a display string (e.g. "€15"). Omitted when free. */
  price?: string;
  /** Day number this stop belongs to in a multi-day itinerary (1-based). */
  day?: number;
}

export interface Tour {
  id: string;
  placeId: string;
  city: string;
  country: string;
  language?: string;
  description: string;
  color: string;
  /** Optional remote image URL shown in city cards/hero banners when available. */
  imageUrl?: string;
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
