import { Platform } from 'react-native';
import { LanguageCode } from '@/i18n/translations';
import { Stop, StopType, Tour } from '../types';

const REQUEST_TIMEOUT_MS = 20000;
const LOCALHOST_PORT = 3000;
const VALID_STOP_TYPES: StopType[] = [
  'landmark',
  'museum',
  'neighborhood',
  'temple',
  'shrine',
  'park',
  'piazza',
  'market',
  'beach',
];
const VALID_LANGUAGE_CODES: LanguageCode[] = ['en', 'ar', 'he', 'es', 'fr'];

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Tour API: missing or invalid field "${field}"`);
  }
  return value;
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new Error(`Tour API: missing or invalid field "${field}"`);
  }
  return value;
}

function mapApiStop(raw: unknown, index: number): Stop {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`Tour API: stop at index ${index} is not an object`);
  }
  const s = raw as Record<string, unknown>;

  const coordinate = s.coordinate;
  if (!coordinate || typeof coordinate !== 'object' || Array.isArray(coordinate)) {
    throw new Error(`Tour API: stops[${index}].coordinate is missing or invalid`);
  }
  const coord = coordinate as Record<string, unknown>;

  const rawType = requireString(s.type, `stops[${index}].type`);
  if ((VALID_STOP_TYPES as string[]).indexOf(rawType) === -1) {
    throw new Error(`Tour API: stops[${index}].type "${rawType}" is not a recognised StopType`);
  }

  return {
    id: requireString(s.id, `stops[${index}].id`),
    order: requireNumber(s.order, `stops[${index}].order`),
    name: requireString(s.name, `stops[${index}].name`),
    address: requireString(s.address, `stops[${index}].address`),
    coordinate: {
      latitude: requireNumber(coord.latitude, `stops[${index}].coordinate.latitude`),
      longitude: requireNumber(coord.longitude, `stops[${index}].coordinate.longitude`),
    },
    type: rawType as StopType,
    description: requireString(s.description, `stops[${index}].description`),
    duration: requireNumber(s.duration, `stops[${index}].duration`),
    ...(typeof s.imageUrl === 'string' ? { imageUrl: s.imageUrl } : {}),
    ...(typeof s.tips === 'string' ? { tips: s.tips } : {}),
    ...(typeof s.walkingTime === 'number' ? { walkingTime: s.walkingTime } : {}),
    ...(typeof s.price === 'string' ? { price: s.price } : {}),
    ...(typeof s.day === 'number' ? { day: s.day } : {}),
  };
}

function mapApiTourToTour(data: unknown): Tour {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Tour API returned an invalid payload');
  }
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.stops)) {
    throw new Error('Tour API returned an invalid payload');
  }
  return {
    id: requireString(d.id, 'id'),
    placeId: requireString(d.placeId, 'placeId'),
    city: requireString(d.city, 'city'),
    country: requireString(d.country, 'country'),
    description: requireString(d.description, 'description'),
    color: requireString(d.color, 'color'),
    ...(typeof d.language === 'string' && VALID_LANGUAGE_CODES.indexOf(d.language as LanguageCode) !== -1
      ? { language: d.language as LanguageCode }
      : {}),
    ...(typeof d.imageUrl === 'string' ? { imageUrl: d.imageUrl } : {}),
    stops: d.stops.map((stop, index) => mapApiStop(stop, index)),
  };
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

export async function fetchCityTour(
  placeId: string,
  cityName: string,
  country: string,
  languageCode: LanguageCode,
): Promise<Tour> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('API base URL is not configured.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({
      placeId,
      city: cityName.trim(),
      ...(country.trim() ? { country: country.trim() } : {}),
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
      throw new Error(`Tour API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return mapApiTourToTour(data);
  } finally {
    clearTimeout(timeout);
  }
}
