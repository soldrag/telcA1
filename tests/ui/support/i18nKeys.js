import { en } from '../../../src/i18n/locales/en.js';

function flattenKeys(tree, prefix = '') {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' ? flattenKeys(value, path) : [path];
  });
}

const TRANSLATION_KEYS = flattenKeys(en);

/** Translation keys that leaked into the visible text instead of their translation. */
export function findRawTranslationKeys(visibleText) {
  return TRANSLATION_KEYS.filter((key) => visibleText.includes(key));
}

export { en };
