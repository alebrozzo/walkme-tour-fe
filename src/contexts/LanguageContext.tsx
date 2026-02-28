import React, { createContext, useCallback, useContext, useState } from 'react';
import { I18nManager } from 'react-native';
import { Language, LanguageCode, LANGUAGES, Translations, TRANSLATIONS } from '../i18n/translations';

interface LanguageContextValue {
  language: Language;
  t: Translations;
  setLanguage: (code: LanguageCode) => void;
  languages: Language[];
  /** Incremented when the RTL direction changes; use as `key` on the root navigator to force re-mount. */
  appKey: number;
}

const DEFAULT_LANGUAGE_CODE: LanguageCode = 'en';
const defaultLanguage = LANGUAGES.find((l) => l.code === DEFAULT_LANGUAGE_CODE) ?? LANGUAGES[0];

const LanguageContext = createContext<LanguageContextValue>({
  language: defaultLanguage,
  t: TRANSLATIONS.en,
  setLanguage: () => {},
  languages: LANGUAGES,
  appKey: 0,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [appKey, setAppKey] = useState(0);

  const setLanguage = useCallback((code: LanguageCode) => {
    const newLang = LANGUAGES.find((l) => l.code === code) ?? defaultLanguage;
    if (I18nManager.isRTL !== newLang.isRTL) {
      I18nManager.forceRTL(newLang.isRTL);
      setAppKey((k) => k + 1);
    }
    setLanguageState(newLang);
  }, []);

  return (
    <LanguageContext.Provider
      value={{ language, t: TRANSLATIONS[language.code], setLanguage, languages: LANGUAGES, appKey }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
