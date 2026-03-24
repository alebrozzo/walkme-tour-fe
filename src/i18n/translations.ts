import { LanguageCode, Translations } from './types';
import en from './en';
import ar from './ar';
import he from './he';
import es from './es';
import fr from './fr';

export { LanguageCode, Language, LANGUAGES, Translations } from './types';
export const TRANSLATIONS: Record<LanguageCode, Translations> = { en, ar, he, es, fr };
