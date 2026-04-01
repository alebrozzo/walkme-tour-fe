import { LanguageCode } from '@/i18n/types';

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

export type StopBadge = 'must-see' | 'photo-spot' | 'family-friendly' | 'historic' | 'indoor' | 'outdoor' | 'free';

export type Difficulty = 'easy' | 'moderate' | 'hard';

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
  /** Google Maps Place ID, used to render the place name correctly in Maps URLs. */
  googlePlaceId?: string;
  /** Localized opening hours from Google Places, one line per day when available. */
  openingHours?: string[];
  /** Average rating from Google Places. */
  rating?: number;
  /** Number of ratings behind the average rating. */
  ratingCount?: number;
  /** Concise highlights generated for decision-making on the stop screen. */
  highlights?: string[];
  /** Short explanation of what this stop is known for. */
  knownFor?: string;
  /** Curated and derived badges shown as chips on the stop screen. */
  badges?: StopBadge[];
  /** Day number this stop belongs to in a multi-day itinerary (1-based). */
  day?: number;
}

export interface Tour {
  id: string;
  placeId: string;
  city: string;
  country: string;
  language?: LanguageCode;
  description: string;
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
  Stop: { stop: Stop };
  Settings: undefined;
};
