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
  console.log('[placesApi] searchCities called', { languageCode });

  if (!query.trim()) {
    console.log('[placesApi] empty query, returning []');
    return [];
  }
  if (!apiKey) {
    console.warn('[placesApi] EXPO_PUBLIC_GOOGLE_PLACES_API_KEY is not set — returning []');
    return [];
  }

  console.log('[placesApi] calling Places Autocomplete API');
  let response: Response;
  try {
    response = await fetch(AUTOCOMPLETE_URL, {
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
  } catch (err) {
    console.error('[placesApi] fetch threw', err);
    throw err;
  }

  console.log('[placesApi] response status', response.status);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error('[placesApi] Places Autocomplete error', { status: response.status, body });
    throw new Error(`Places Autocomplete error: ${response.status}`);
  }

  const data = (await response.json()) as AutocompleteResponse;
  console.log('[placesApi] suggestions count', data.suggestions?.length ?? 0);

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
