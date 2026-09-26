const LOCALE_BY_LANGUAGE = { ru: 'ru-RU', en: 'en-GB', de: 'de-DE' };

/** Official telc points can be fractional (1.5, 8.5): format them with the learner's decimal separator. */
export function formatPoints(value, language = 'de') {
  const locale = LOCALE_BY_LANGUAGE[language] || LOCALE_BY_LANGUAGE.de;
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(Number(value) || 0);
}
