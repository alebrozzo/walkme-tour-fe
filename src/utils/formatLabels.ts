import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';

/** Formats a duration in minutes as "Xh Ym" (when ≥ 60) or "X min". */
export function formatMinutes(totalMinutes: number, minUnit: string): string {
  if (totalMinutes >= 60) {
    return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
  }
  return `${totalMinutes} ${minUnit}`;
}

const KM_TO_MI = 0.621371;

/** Hook that returns a formatter converting km to the user's chosen distance unit. */
export function useFormatDistance(): (km: number) => string {
  const { distanceUnit } = useSettings();
  const { t } = useLanguage();
  return (km: number) => {
    if (distanceUnit === 'mi') {
      return `${(km * KM_TO_MI).toFixed(1)} ${t.units.mi}`;
    }
    return `${km.toFixed(1)} ${t.units.km}`;
  };
}
