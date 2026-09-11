export const STORAGE_KEY = 'telc_app_language';
export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'ru'];

/**
 * Checks whether a language string is supported.
 */
export function isSupportedLanguage(lang) {
  return typeof lang === 'string' && SUPPORTED_LANGUAGES.includes(lang.toLowerCase());
}

/**
 * Inspects browser navigator languages to detect Russian preference.
 */
function detectBrowserLanguage() {
  if (typeof window === 'undefined' || !window.navigator) {
    return DEFAULT_LANGUAGE;
  }

  const rawCandidates = [
    ...(window.navigator.languages || []),
    window.navigator.language,
    window.navigator.userLanguage,
  ].filter(Boolean);

  for (const candidate of rawCandidates) {
    const normalized = candidate.toLowerCase().trim();
    if (normalized.startsWith('ru')) {
      return 'ru';
    }
    if (normalized.startsWith('en')) {
      return 'en';
    }
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Detects initial language prioritizing saved preference, then browser language, then default.
 */
export function detectInitialLanguage() {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (isSupportedLanguage(stored)) {
      return stored.toLowerCase();
    }
  } catch {
    // Storage access might be restricted in private/iframe environments
  }

  return detectBrowserLanguage();
}

/**
 * Safely persists language choice to storage.
 */
export function persistLanguage(lang) {
  if (!isSupportedLanguage(lang)) return;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Gracefully handle storage errors
  }
}
