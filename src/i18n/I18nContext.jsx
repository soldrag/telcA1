import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { en } from './locales/en.js';
import { ru } from './locales/ru.js';
import {
  detectInitialLanguage,
  persistLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
} from './languageDetector.js';
import { interpolate } from './interpolate.js';

const LOCALES = { en, ru };

const I18nContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key,
  supportedLanguages: SUPPORTED_LANGUAGES,
});

/**
 * Resolves a dot-notated key path from a locale object.
 */
function resolveKeyPath(dict, path) {
  if (!dict || typeof dict !== 'object' || !path) return undefined;
  return path.split('.').reduce((acc, segment) => acc?.[segment], dict);
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(detectInitialLanguage);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((newLang) => {
    const normalized = String(newLang).toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(normalized)) {
      setLanguageState(normalized);
      persistLanguage(normalized);
    }
  }, []);

  const t = useCallback((keyPath, params) => {
    const currentDict = LOCALES[language] || LOCALES[DEFAULT_LANGUAGE];
    const fallbackDict = LOCALES[DEFAULT_LANGUAGE];

    const rawValue = resolveKeyPath(currentDict, keyPath) ?? resolveKeyPath(fallbackDict, keyPath);
    if (rawValue === undefined) {
      return keyPath;
    }
    return interpolate(rawValue, params);
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isRussian: language === 'ru',
    isEnglish: language === 'en',
  }), [language, setLanguage, t]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
