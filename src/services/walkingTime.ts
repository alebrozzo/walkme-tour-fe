import { Coordinate } from '../types';

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
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Estimates walking time in minutes between two coordinates.
 * Uses straight-line distance × 1.3 detour factor at 5 km/h.
 * Returns at least 1 minute for any non-zero distance.
 */
export function estimateWalkingTime(a: Coordinate, b: Coordinate): number {
  const distanceKm = haversineDistanceKm(a, b) * 1.3; // detour factor
  const minutes = (distanceKm / WALKING_SPEED_KM_H) * MINUTES_PER_HOUR;
  return Math.max(1, Math.round(minutes));
}
