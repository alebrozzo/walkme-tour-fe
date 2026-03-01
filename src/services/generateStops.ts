import { Stop, TripPreferences } from '../types';

const API_DELAY_MS = 1500;

/**
 * Generates a recommended list of stops based on trip preferences and available stops.
 * Stops are distributed across days so that no single day exceeds the hoursPerDay limit.
 * Mimics an async API call so it can be swapped for a real AI-powered endpoint later.
 */
export async function generateRecommendedStops(allStops: Stop[], preferences: TripPreferences): Promise<Stop[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, API_DELAY_MS));

  const minutesPerDay = preferences.hoursPerDay * 60;

  const selected: Stop[] = [];
  let stopIndex = 0;
  let order = 1;

  for (let day = 1; day <= preferences.days; day++) {
    let remainingToday = minutesPerDay;
    let isFirstStopOfDay = true;

    while (stopIndex < allStops.length) {
      const stop = allStops[stopIndex];
      // Walking time only applies within the same day; no walking overhead at the start of a new day
      const walkFromPrev = isFirstStopOfDay ? 0 : (selected[selected.length - 1].walkingTime ?? 0);
      const needed = stop.duration + walkFromPrev;
      if (needed <= remainingToday) {
        selected.push({ ...stop, order, day });
        remainingToday -= needed;
        stopIndex++;
        order++;
        isFirstStopOfDay = false;
      } else {
        // Stop doesn't fit in the remaining time today; move to the next day
        break;
      }
    }
  }

  return selected;
}
