import { Coordinate, Stop } from '../types';

const EARTH_RADIUS_KM = 6371;
const WALKING_SPEED_KM_H = 5;
const MINUTES_PER_HOUR = 60;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Returns the straight-line distance in km between two coordinates (Haversine). */
function haversineDistanceKm(a: Coordinate, b: Coordinate): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * sinLon * sinLon;
  const hClamped = Math.min(1, Math.max(0, h));
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(hClamped));
}

/**
 * Estimates walking time in minutes between two coordinates.
 * Uses straight-line distance × 1.3 detour factor at 5 km/h.
 * Returns at least 0 minutes (0 for identical coordinates).
 */
export function estimateWalkingTime(a: Coordinate, b: Coordinate): number {
  const distanceKm = haversineDistanceKm(a, b) * 1.3; // detour factor
  const minutes = (distanceKm / WALKING_SPEED_KM_H) * MINUTES_PER_HOUR;
  return Math.round(minutes);
}

/**
 * Sums the walking distance and time across all stops, computed directly from coordinates.
 * Only legs within the same day are counted.
 */
export function computeTripTotals(stops: Stop[]): { totalMinutes: number; totalKm: number } {
  let totalMinutes = 0;
  let totalKm = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const current = stops[i];
    const next = stops[i + 1];
    if (current.day === next.day) {
      const distKm = haversineDistanceKm(current.coordinate, next.coordinate) * 1.3;
      totalKm += distKm;
      totalMinutes += Math.round((distKm / WALKING_SPEED_KM_H) * MINUTES_PER_HOUR);
    }
  }
  return { totalMinutes, totalKm };
}
