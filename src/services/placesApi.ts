import { LanguageCode } from '../i18n/types';

export interface CityPrediction {
  placeId: string;
  city: string;
  country: string;
  description: string;
}

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';

interface PlacePrediction {
  placeId: string;
  text: { text: string };
  structuredFormat?: {
    mainText: { text: string };
    secondaryText?: { text: string };
  };
}

interface AutocompleteResponse {
  suggestions?: Array<{ placePrediction: PlacePrediction }>;
}

export async function searchCities(
  query: string,
  languageCode: LanguageCode,
  signal?: AbortSignal,
): Promise<CityPrediction[]> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!query.trim() || !apiKey) {
    return [];
  }

  const response = await fetch(AUTOCOMPLETE_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify({
      input: query.trim(),
      includedPrimaryTypes: ['locality'],
      languageCode,
    }),
  });

  if (!response.ok) {
    throw new Error(`Places Autocomplete error: ${response.status}`);
  }

  const data = (await response.json()) as AutocompleteResponse;

  return (data.suggestions ?? []).map(({ placePrediction: p }) => {
    const secondary = p.structuredFormat?.secondaryText?.text ?? '';
    const parts = secondary.split(',').map((s) => s.trim());
    const country = parts[parts.length - 1] ?? '';
    const city = p.structuredFormat?.mainText.text ?? p.text.text;

    return {
      placeId: p.placeId,
      city,
      country,
      description: p.text.text,
    };
  });
}
