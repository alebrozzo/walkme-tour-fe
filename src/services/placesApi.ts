import { LanguageCode } from '@/i18n/translations';

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const REQUEST_TIMEOUT_MS = 5000;

export interface PlaceSuggestion {
  placeId: string;
  name: string;
  country: string;
}

function getPlacesApiKey(): string | null {
  return process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY?.trim() || null;
}

export function hasPlacesApiKey(): boolean {
  return !!getPlacesApiKey();
}

export async function searchCities(input: string, languageCode: LanguageCode): Promise<PlaceSuggestion[]> {
  const apiKey = getPlacesApiKey();
  if (!apiKey || !input.trim()) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(AUTOCOMPLETE_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        input: input.trim(),
        includedPrimaryTypes: ['locality'],
        languageCode,
      }),
    });

    console.log('[Places] response status:', response.status);
    if (!response.ok) return [];

    interface PlacePrediction {
      placeId: string;
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
      text?: { text?: string };
    }
    interface AutocompleteResponse {
      suggestions?: Array<{ placePrediction?: PlacePrediction }>;
    }

    const data = (await response.json()) as AutocompleteResponse;
    console.log('[Places] data:', JSON.stringify(data).slice(0, 500));
    if (!Array.isArray(data.suggestions)) return [];

    return data.suggestions
      .map((s) => s.placePrediction)
      .filter((p): p is PlacePrediction => !!p)
      .map((p) => ({
        placeId: p.placeId,
        name: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
        country: p.structuredFormat?.secondaryText?.text ?? '',
      }));
  } catch (err) {
    if (__DEV__) {
      console.warn('[Places] searchCities failed:', err);
    }
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
