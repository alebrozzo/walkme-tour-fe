/** Formats a duration in minutes using localized units. */
export function formatMinutes(totalMinutes: number, minUnit: string, hourUnit?: string): string {
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const resolvedHourUnit = hourUnit ?? 'h';

    if (minutes === 0) {
      return `${hours}${resolvedHourUnit}`;
    }

    return `${hours}${resolvedHourUnit} ${minutes} ${minUnit}`;
  }
  return `${totalMinutes} ${minUnit}`;
}

/** Formats a distance in km as "X.X km". */
export function formatKm(km: number, kmUnit: string): string {
  return `${km.toFixed(1)} ${kmUnit}`;
}
