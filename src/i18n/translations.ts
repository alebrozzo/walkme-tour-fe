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
  difficulty: Record<'easy' | 'moderate' | 'hard', string>;
  units: {
    min: string;
    km: string;
    stops: (n: number) => string;
    minutes: (n: number) => string;
  };
  tour: {
    stopsSection: string;
  };
  stop: {
    address: string;
    timeAtStop: string;
    stopNumber: string;
    stopOnTour: (n: number) => string;
    about: string;
    visitorTips: string;
  };
  stopTypes: Record<StopType, string>;
  language: string;
  selectLanguage: string;
}

const en: Translations = {
  appTitle: 'WalkMe Tour',
  headerTitle: 'Walking Tours',
  headerSubtitle: 'Explore the world one step at a time',
  searchPlaceholder: 'Search for a city…',
  searchNoResults: 'No cities found',
  difficulty: {
    easy: 'Easy',
    moderate: 'Moderate',
    hard: 'Hard',
  },
  units: {
    min: 'min',
    km: 'km',
    stops: (n) => `${n} stop${n === 1 ? '' : 's'}`,
    minutes: (n) => `${n} minute${n === 1 ? '' : 's'}`,
  },
  tour: { stopsSection: 'Stops' },
  stop: {
    address: 'Address',
    timeAtStop: 'Time at stop',
    stopNumber: 'Stop number',
    stopOnTour: (n) => `Stop ${n} on the tour`,
    about: 'About',
    visitorTips: 'Visitor Tips',
  },
  stopTypes: {
    landmark: 'Landmark',
    museum: 'Museum',
    neighborhood: 'Neighborhood',
    temple: 'Temple',
    shrine: 'Shrine',
    park: 'Park',
    piazza: 'Piazza',
    market: 'Market',
    beach: 'Beach',
  },
  language: 'Language',
  selectLanguage: 'Select Language',
};

const ar: Translations = {
  appTitle: 'جولة WalkMe',
  headerTitle: 'جولات سير',
  headerSubtitle: 'استكشف العالم خطوة بخطوة',
  searchPlaceholder: 'ابحث عن مدينة…',
  searchNoResults: 'لا توجد مدن',
  difficulty: {
    easy: 'سهل',
    moderate: 'متوسط',
    hard: 'صعب',
  },
  units: {
    min: 'دقيقة',
    km: 'كم',
    stops: (n) => `${n} محطات`,
    minutes: (n) => `${n} دقائق`,
  },
  tour: { stopsSection: 'المحطات' },
  stop: {
    address: 'العنوان',
    timeAtStop: 'الوقت عند المحطة',
    stopNumber: 'رقم المحطة',
    stopOnTour: (n) => `المحطة ${n} في الجولة`,
    about: 'حول',
    visitorTips: 'نصائح للزوار',
  },
  stopTypes: {
    landmark: 'معلم',
    museum: 'متحف',
    neighborhood: 'حي',
    temple: 'معبد',
    shrine: 'ضريح',
    park: 'حديقة',
    piazza: 'ميدان',
    market: 'سوق',
    beach: 'شاطئ',
  },
  language: 'اللغة',
  selectLanguage: 'اختر اللغة',
};

const he: Translations = {
  appTitle: 'WalkMe טיול',
  headerTitle: 'סיורים רגליים',
  headerSubtitle: 'גלה את העולם צעד אחר צעד',
  searchPlaceholder: 'חפש עיר…',
  searchNoResults: 'לא נמצאו ערים',
  difficulty: {
    easy: 'קל',
    moderate: 'בינוני',
    hard: 'קשה',
  },
  units: {
    min: "דק'",
    km: 'ק"מ',
    stops: (n) => `${n} עצירות`,
    minutes: (n) => `${n} דקות`,
  },
  tour: { stopsSection: 'עצירות' },
  stop: {
    address: 'כתובת',
    timeAtStop: 'זמן בעצירה',
    stopNumber: 'מספר עצירה',
    stopOnTour: (n) => `עצירה ${n} בסיור`,
    about: 'אודות',
    visitorTips: 'טיפים למבקרים',
  },
  stopTypes: {
    landmark: 'אתר',
    museum: 'מוזיאון',
    neighborhood: 'שכונה',
    temple: 'מקדש',
    shrine: 'מקדש',
    park: 'פארק',
    piazza: 'כיכר',
    market: 'שוק',
    beach: 'חוף',
  },
  language: 'שפה',
  selectLanguage: 'בחר שפה',
};

const es: Translations = {
  appTitle: 'WalkMe Tour',
  headerTitle: 'Tours a Pie',
  headerSubtitle: 'Explora el mundo paso a paso',
  searchPlaceholder: 'Buscar una ciudad…',
  searchNoResults: 'No se encontraron ciudades',
  difficulty: {
    easy: 'Fácil',
    moderate: 'Moderado',
    hard: 'Difícil',
  },
  units: {
    min: 'min',
    km: 'km',
    stops: (n) => `${n} parada${n === 1 ? '' : 's'}`,
    minutes: (n) => `${n} minutos`,
  },
  tour: { stopsSection: 'Paradas' },
  stop: {
    address: 'Dirección',
    timeAtStop: 'Tiempo en parada',
    stopNumber: 'Número de parada',
    stopOnTour: (n) => `Parada ${n} del tour`,
    about: 'Acerca de',
    visitorTips: 'Consejos para visitantes',
  },
  stopTypes: {
    landmark: 'Monumento',
    museum: 'Museo',
    neighborhood: 'Barrio',
    temple: 'Templo',
    shrine: 'Santuario',
    park: 'Parque',
    piazza: 'Plaza',
    market: 'Mercado',
    beach: 'Playa',
  },
  language: 'Idioma',
  selectLanguage: 'Seleccionar idioma',
};

const fr: Translations = {
  appTitle: 'WalkMe Tour',
  headerTitle: 'Visites à Pied',
  headerSubtitle: 'Explorez le monde pas à pas',
  searchPlaceholder: 'Rechercher une ville…',
  searchNoResults: 'Aucune ville trouvée',
  difficulty: {
    easy: 'Facile',
    moderate: 'Modéré',
    hard: 'Difficile',
  },
  units: {
    min: 'min',
    km: 'km',
    stops: (n) => `${n} arrêt${n === 1 ? '' : 's'}`,
    minutes: (n) => `${n} minutes`,
  },
  tour: { stopsSection: 'Arrêts' },
  stop: {
    address: 'Adresse',
    timeAtStop: "Temps à l'arrêt",
    stopNumber: "Numéro d'arrêt",
    stopOnTour: (n) => `Arrêt ${n} du tour`,
    about: 'À propos',
    visitorTips: 'Conseils aux visiteurs',
  },
  stopTypes: {
    landmark: 'Monument',
    museum: 'Musée',
    neighborhood: 'Quartier',
    temple: 'Temple',
    shrine: 'Sanctuaire',
    park: 'Parc',
    piazza: 'Place',
    market: 'Marché',
    beach: 'Plage',
  },
  language: 'Langue',
  selectLanguage: 'Sélectionner la langue',
};

export const TRANSLATIONS: Record<LanguageCode, Translations> = { en, ar, he, es, fr };
