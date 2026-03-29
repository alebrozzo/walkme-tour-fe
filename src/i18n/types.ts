import { StopType } from '../types';

export type LanguageCode = 'en' | 'ar' | 'he' | 'es' | 'fr';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRTL: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', isRTL: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
];

export interface Translations {
  appTitle: string;
  headerTitle: string;
  headerSubtitle: string;
  searchPlaceholder: string;
  searchNoResults: string;
  languageNames: Record<LanguageCode, string>;
  home: {
    offlineModeTitle: string;
    offlineModeMessage: string;
    errorTitle: string;
    serverErrorMessage: string;
    requestErrorMessage: string;
    loadingTour: string;
    timeoutErrorMessage: string;
  };
  difficulty: Record<'easy' | 'moderate' | 'hard', string>;
  units: {
    min: string;
    km: string;
    mi: string;
    stops: (n: number) => string;
    minutes: (n: number) => string;
  };
  tour: {
    planYourVisit: string;
    daysStaying: string;
    hoursPerDay: string;
    hoursPerDayHint: string;
    generateStops: string;
    generating: string;
    recommendedStops: string;
    noRecommendedStops: string;
    adjustPreferences: string;
    walkingMinutes: (n: number) => string;
    day: (n: number) => string;
    free: string;
    viewOnMap: string;
    moveUp: string;
    moveDown: string;
    removeStop: string;
    removeStopTitle: string;
    removeStopMessage: string;
    confirmRemove: string;
    cancelRemove: string;
  };
  stop: {
    address: string;
    timeAtStop: string;
    about: string;
    visitorTips: string;
    price: string;
    listenAbout: string;
    stopListening: string;
    viewFullScreen: string;
    closeImage: string;
  };
  stopTypes: Record<StopType, string>;
  language: string;
  selectLanguage: string;
  removeCity: string;
  recentCities: string;
  settings: {
    title: string;
    language: string;
    distanceUnit: string;
    km: string;
    mi: string;
  };
}
