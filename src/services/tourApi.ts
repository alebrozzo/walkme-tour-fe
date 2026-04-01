import { Platform } from 'react-native';
import { LanguageCode } from '@/i18n/translations';
import { Stop, Tour } from '../types';

const REQUEST_TIMEOUT_MS = 20000;
const LOCALHOST_PORT = 3000;

export class TourApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'TourApiError';
  }
}

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
  openingHours?: Stop['openingHours'];
  rating?: number;
  ratingCount?: number;
  highlights?: Stop['highlights'];
  knownFor?: string;
  badges?: Stop['badges'];
  googlePlaceId?: string;
}

interface ApiTour {
  id: string;
  placeId: string;
  city: string;
  country: string;
  language: LanguageCode;
  description: string;
  color: string;
  imageUrl?: string;
  stops: ApiStop[];
}

function getApiBaseUrl(): string | null {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // Platform-aware localhost fallback for development
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${LOCALHOST_PORT}`;
    }
    return `http://localhost:${LOCALHOST_PORT}`;
  }

  return null;
}

export async function fetchTourForCity(localTour: Tour, languageCode: LanguageCode): Promise<Tour> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    console.warn('API base URL is not configured. Returning local tour data only.');
    return localTour;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({
      placeId: localTour.placeId,
      city: localTour.city,
      country: localTour.country,
      language: languageCode,
    });

    console.log(`Fetching tour data from API: ${baseUrl}/api/cities?${params.toString()}`);
    const response = await fetch(`${baseUrl}/api/cities?${params.toString()}`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new TourApiError(`Tour API request failed with status ${response.status}`, response.status);
    }

    const data = (await response.json()) as ApiTour;
    if (!Array.isArray(data.stops)) {
      throw new Error('Tour API returned an invalid payload');
    }

    return {
      ...localTour,
      ...data,
    };
  } finally {
    clearTimeout(timeout);
  }
}
