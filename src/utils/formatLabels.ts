/** Formats a duration in minutes as "Xh Ym" (when ≥ 60) or "X min". */
export function formatMinutes(totalMinutes: number, minUnit: string): string {
  if (totalMinutes >= 60) {
    return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
  }
  return `${totalMinutes} ${minUnit}`;
}

/** Formats a distance in km as "X.X km". */
export function formatKm(km: number, kmUnit: string): string {
  return `${km.toFixed(1)} ${kmUnit}`;
}
