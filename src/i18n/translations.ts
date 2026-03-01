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
    free: string;
  };
  stop: {
    address: string;
    timeAtStop: string;
    stopNumber: string;
    stopOnTour: (n: number) => string;
    about: string;
    visitorTips: string;
    price: string;
  };
  stopTypes: Record<StopType, string>;
  language: string;
  selectLanguage: string;
  pinCity: string;
  unpinCity: string;
  pinnedCities: string;
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
  tour: {
    planYourVisit: 'Plan Your Visit',
    daysStaying: 'How many days are you staying?',
    hoursPerDay: 'Hours per day for walking & visiting',
    hoursPerDayHint: 'Exclude time for resting and eating',
    generateStops: 'Get Recommended Stops',
    generating: 'Generating your itinerary…',
    recommendedStops: 'Recommended Stops',
    noRecommendedStops: 'No stops fit your available time. Try adjusting your preferences.',
    adjustPreferences: 'Adjust Preferences',
    walkingMinutes: (n) => `${n} min walk`,
    free: 'Free',
  },
  stop: {
    address: 'Address',
    timeAtStop: 'Time at stop',
    stopNumber: 'Stop number',
    stopOnTour: (n) => `Stop ${n} on the tour`,
    about: 'About',
    visitorTips: 'Visitor Tips',
    price: 'Price',
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
  pinCity: 'Pin city',
  unpinCity: 'Unpin city',
  pinnedCities: 'Pinned Cities',
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
  tour: {
    planYourVisit: 'خطط لزيارتك',
    daysStaying: 'كم يوماً ستبقى؟',
    hoursPerDay: 'ساعات المشي والزيارة في اليوم',
    hoursPerDayHint: 'لا تشمل وقت الراحة والأكل',
    generateStops: 'احصل على محطات مقترحة',
    generating: 'جارٍ إنشاء خطتك…',
    recommendedStops: 'المحطات المقترحة',
    noRecommendedStops: 'لا توجد محطات تناسب وقتك المتاح. حاول تعديل تفضيلاتك.',
    adjustPreferences: 'تعديل التفضيلات',
    walkingMinutes: (n) => `${n} دقائق مشي`,
    free: 'مجاني',
  },
  stop: {
    address: 'العنوان',
    timeAtStop: 'الوقت عند المحطة',
    stopNumber: 'رقم المحطة',
    stopOnTour: (n) => `المحطة ${n} في الجولة`,
    about: 'حول',
    visitorTips: 'نصائح للزوار',
    price: 'السعر',
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
  pinCity: 'تثبيت المدينة',
  unpinCity: 'إلغاء التثبيت',
  pinnedCities: 'المدن المثبتة',
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
  tour: {
    planYourVisit: 'תכנן את הביקור שלך',
    daysStaying: 'כמה ימים אתה נשאר?',
    hoursPerDay: 'שעות ביום להליכה וביקורים',
    hoursPerDayHint: 'לא כולל זמן מנוחה ואכילה',
    generateStops: 'קבל עצירות מומלצות',
    generating: 'מייצר את המסלול שלך…',
    recommendedStops: 'עצירות מומלצות',
    noRecommendedStops: 'אין עצירות שמתאימות לזמן שלך. נסה לשנות את ההעדפות.',
    adjustPreferences: 'שנה העדפות',
    walkingMinutes: (n) => `${n} דקות הליכה`,
    free: 'חינם',
  },
  stop: {
    address: 'כתובת',
    timeAtStop: 'זמן בעצירה',
    stopNumber: 'מספר עצירה',
    stopOnTour: (n) => `עצירה ${n} בסיור`,
    about: 'אודות',
    visitorTips: 'טיפים למבקרים',
    price: 'מחיר',
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
  pinCity: 'נעץ עיר',
  unpinCity: 'הסר נעיצה',
  pinnedCities: 'ערים מנועצות',
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
  tour: {
    planYourVisit: 'Planifica tu visita',
    daysStaying: '¿Cuántos días te quedas?',
    hoursPerDay: 'Horas por día para caminar y visitar',
    hoursPerDayHint: 'Sin incluir tiempo de descanso y comida',
    generateStops: 'Obtener paradas recomendadas',
    generating: 'Generando tu itinerario…',
    recommendedStops: 'Paradas recomendadas',
    noRecommendedStops: 'No hay paradas que se ajusten a tu tiempo disponible. Intenta ajustar tus preferencias.',
    adjustPreferences: 'Ajustar preferencias',
    walkingMinutes: (n) => `${n} min caminando`,
    free: 'Gratis',
  },
  stop: {
    address: 'Dirección',
    timeAtStop: 'Tiempo en parada',
    stopNumber: 'Número de parada',
    stopOnTour: (n) => `Parada ${n} del tour`,
    about: 'Acerca de',
    visitorTips: 'Consejos para visitantes',
    price: 'Precio',
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
  pinCity: 'Fijar ciudad',
  unpinCity: 'Desfijar ciudad',
  pinnedCities: 'Ciudades fijadas',
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
  tour: {
    planYourVisit: 'Planifiez votre visite',
    daysStaying: 'Combien de jours restez-vous ?',
    hoursPerDay: 'Heures par jour de marche et visites',
    hoursPerDayHint: 'Sans compter le repos et les repas',
    generateStops: 'Obtenir les arrêts recommandés',
    generating: 'Génération de votre itinéraire…',
    recommendedStops: 'Arrêts recommandés',
    noRecommendedStops: "Aucun arrêt ne correspond à votre temps disponible. Essayez d'ajuster vos préférences.",
    adjustPreferences: 'Ajuster les préférences',
    walkingMinutes: (n) => `${n} min à pied`,
    free: 'Gratuit',
  },
  stop: {
    address: 'Adresse',
    timeAtStop: "Temps à l'arrêt",
    stopNumber: "Numéro d'arrêt",
    stopOnTour: (n) => `Arrêt ${n} du tour`,
    about: 'À propos',
    visitorTips: 'Conseils aux visiteurs',
    price: 'Prix',
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
  pinCity: 'Épingler la ville',
  unpinCity: 'Désépingler la ville',
  pinnedCities: 'Villes épinglées',
};

export const TRANSLATIONS: Record<LanguageCode, Translations> = { en, ar, he, es, fr };
