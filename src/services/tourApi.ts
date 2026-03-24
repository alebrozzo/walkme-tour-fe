import { Platform } from 'react-native';
import { estimateWalkingTime } from './walkingTime';
import { Difficulty, Stop, Tour } from '../types';

const REQUEST_TIMEOUT_MS = 20000;

interface ApiStop {
  id: string;
  order: number;
  name: string;
  address: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  type: Stop['type'];
  imageUrl?: string;
  description: string;
  duration: number;
  price?: string;
}

interface ApiTour {
  id: string;
  city: string;
  country: string;
  description: string;
  color: string;
  imageUrl?: string;
  stops: ApiStop[];
}

function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // Android emulator cannot reach localhost directly.
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}

function normalizeStops(stops: ApiStop[]): Stop[] {
  const sorted = [...stops].sort((a, b) => a.order - b.order);

  return sorted.map((stop, index) => {
    const nextStop = sorted[index + 1];
    return {
      ...stop,
      walkingTime: nextStop ? estimateWalkingTime(stop.coordinate, nextStop.coordinate) : undefined,
    };
  });
}

function estimateTotalDuration(stops: Stop[]): number {
  const visitMinutes = stops.reduce((sum, stop) => sum + stop.duration, 0);
  const walkingMinutes = stops.reduce((sum, stop) => sum + (stop.walkingTime ?? 0), 0);
  return visitMinutes + walkingMinutes;
}

function estimateDistanceKm(stops: Stop[]): number {
  const walkingMinutes = stops.reduce((sum, stop) => sum + (stop.walkingTime ?? 0), 0);
  const km = (walkingMinutes / 60) * 5;
  return Number(km.toFixed(1));
}

function inferDifficulty(distanceKm: number): Difficulty {
  if (distanceKm < 5) return 'easy';
  if (distanceKm < 8) return 'moderate';
  return 'hard';
}

function mergeTourWithLocalDefaults(apiTour: ApiTour, localTour: Tour): Tour {
  const normalizedStops = normalizeStops(apiTour.stops);
  const distance = estimateDistanceKm(normalizedStops);

  return {
    ...localTour,
    id: apiTour.id,
    city: apiTour.city,
    country: apiTour.country,
    description: apiTour.description,
    color: apiTour.color,
    imageUrl: apiTour.imageUrl,
    duration: estimateTotalDuration(normalizedStops),
    distance,
    difficulty: inferDifficulty(distance),
    stops: normalizedStops,
  };
}

export async function fetchTourForCity(localTour: Tour): Promise<Tour> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({
      placeId: localTour.id,
      name: localTour.city,
      country: localTour.country,
    });

    const response = await fetch(`${getApiBaseUrl()}/api/cities?${params.toString()}`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Tour API request failed with status ${response.status}`);
    }

    const data = (await response.json()) as ApiTour;
    if (!Array.isArray(data.stops)) {
      throw new Error('Tour API returned an invalid payload');
    }

    return mergeTourWithLocalDefaults(data, localTour);
  } finally {
    clearTimeout(timeout);
  }
}