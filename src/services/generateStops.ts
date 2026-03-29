import { Stop, TripPreferences } from '../types';
import { estimateWalkingTime } from './walkingTime';

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
      const prevStop = selected[selected.length - 1];
      // Walking time only applies within the same day; no walking overhead at the start of a new day
      const walkFromPrev =
        isFirstStopOfDay || !prevStop ? 0 : estimateWalkingTime(prevStop.coordinate, stop.coordinate);
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

  // Set correct walkingTime between consecutive stops within the same day
  return selected.map((s, i) => {
    const next = i < selected.length - 1 ? selected[i + 1] : undefined;
    const sameDay = next && next.day === s.day;
    return { ...s, walkingTime: sameDay ? estimateWalkingTime(s.coordinate, next.coordinate) : undefined };
  });
}
