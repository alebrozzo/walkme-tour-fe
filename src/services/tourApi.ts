import { Platform } from 'react-native';
import { Stop, Tour } from '../types';

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

    return {
      ...localTour,
      ...data,
    };
  } finally {
    clearTimeout(timeout);
  }
}
