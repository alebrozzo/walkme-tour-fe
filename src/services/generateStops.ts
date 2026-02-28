import { Stop, TripPreferences } from '../types';

const API_DELAY_MS = 1500;

/**
 * Generates a recommended list of stops based on trip preferences and available stops.
 * Mimics an async API call so it can be swapped for a real AI-powered endpoint later.
 */
export async function generateRecommendedStops(
  allStops: Stop[],
  preferences: TripPreferences,
): Promise<Stop[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, API_DELAY_MS));

  const totalMinutes = preferences.days * preferences.hoursPerDay * 60;

  // Greedily pick stops in order until time budget is exhausted
  const selected: Stop[] = [];
  let remaining = totalMinutes;

  for (const stop of allStops) {
    if (remaining <= 0) break;
    if (stop.duration <= remaining) {
      selected.push({ ...stop, order: selected.length + 1 });
      remaining -= stop.duration;
    }
  }

  return selected;
}
