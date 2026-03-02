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
    day: (n: number) => string;
    free: string;
    viewOnMap: string;
    moveUp: string;
    moveDown: string;
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
    day: (n) => `Day ${n}`,
    free: 'Free',
    viewOnMap: 'View on Map',
    moveUp: 'Move up',
    moveDown: 'Move down',
  },
  stop: {
    address: 'Address',
    timeAtStop: 'Time at stop',
    about: 'About',
    visitorTips: 'Visitor Tips',
    price: 'Price',
    listenAbout: 'Listen',
    stopListening: 'Stop',
    viewFullScreen: 'View full screen',
    closeImage: 'Close image',
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
    day: (n) => `اليوم ${n}`,
    free: 'مجاني',
    viewOnMap: 'عرض على الخريطة',
    moveUp: 'نقل لأعلى',
    moveDown: 'نقل لأسفل',
  },
  stop: {
    address: 'العنوان',
    timeAtStop: 'الوقت عند المحطة',
    about: 'حول',
    visitorTips: 'نصائح للزوار',
    price: 'السعر',
    listenAbout: 'استمع',
    stopListening: 'إيقاف',
    viewFullScreen: 'عرض بحجم كامل',
    closeImage: 'إغلاق الصورة',
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
    day: (n) => `יום ${n}`,
    free: 'חינם',
    viewOnMap: 'הצג במפה',
    moveUp: 'הזז למעלה',
    moveDown: 'הזז למטה',
  },
  stop: {
    address: 'כתובת',
    timeAtStop: 'זמן בעצירה',
    about: 'אודות',
    visitorTips: 'טיפים למבקרים',
    price: 'מחיר',
    listenAbout: 'האזן',
    stopListening: 'עצור',
    viewFullScreen: 'הצג במסך מלא',
    closeImage: 'סגור תמונה',
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
    day: (n) => `Día ${n}`,
    free: 'Gratis',
    viewOnMap: 'Ver en el mapa',
    moveUp: 'Mover arriba',
    moveDown: 'Mover abajo',
  },
  stop: {
    address: 'Dirección',
    timeAtStop: 'Tiempo en parada',
    about: 'Acerca de',
    visitorTips: 'Consejos para visitantes',
    price: 'Precio',
    listenAbout: 'Escuchar',
    stopListening: 'Detener',
    viewFullScreen: 'Ver pantalla completa',
    closeImage: 'Cerrar imagen',
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
    day: (n) => `Jour ${n}`,
    free: 'Gratuit',
    viewOnMap: 'Voir sur la carte',
    moveUp: 'Déplacer vers le haut',
    moveDown: 'Déplacer vers le bas',
  },
  stop: {
    address: 'Adresse',
    timeAtStop: "Temps à l'arrêt",
    about: 'À propos',
    visitorTips: 'Conseils aux visiteurs',
    price: 'Prix',
    listenAbout: 'Écouter',
    stopListening: 'Arrêter',
    viewFullScreen: 'Voir en plein écran',
    closeImage: "Fermer l'image",
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
