import { TRANSLATION_CONTRACT } from './contracts/translationContract.js';
import { en } from './locales/en.js';
import { ru } from './locales/ru.js';

/**
 * Extracts `{param}` placeholders from a template string.
 */
function extractPlaceholders(template) {
  if (typeof template !== 'string') return [];
  const matches = template.match(/\{([a-zA-Z0-9_]+)\}/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(1, -1)))].sort();
}

/**
 * Validates a single leaf string against contract requirements.
 */
function validateLeafNode(path, actualValue, refTemplate) {
  const errors = [];
  if (typeof actualValue !== 'string') {
    errors.push(`[${path}] Expected type string, got ${typeof actualValue}`);
    return errors;
  }
  if (actualValue.trim().length === 0) {
    errors.push(`[${path}] String cannot be empty`);
    return errors;
  }
  if (typeof refTemplate === 'string') {
    const expectedPlaceholders = extractPlaceholders(refTemplate);
    const actualPlaceholders = extractPlaceholders(actualValue);
    const missing = expectedPlaceholders.filter(p => !actualPlaceholders.includes(p));
    if (missing.length > 0) {
      errors.push(`[${path}] Missing expected placeholder(s): ${missing.join(', ')}`);
    }
  }
  return errors;
}

/**
 * Validates structure and keys of a locale object against the contract recursively.
 */
function validateStructure(target, contract, refSource, currentPath = '') {
  const errors = [];
  const contractKeys = Object.keys(contract);
  const targetKeys = Object.keys(target || {});

  // Guard: Detect missing keys
  for (const key of contractKeys) {
    const subPath = currentPath ? `${currentPath}.${key}` : key;
    if (!(key in (target || {}))) {
      errors.push(`[${subPath}] Missing required contract key`);
      continue;
    }

    const contractVal = contract[key];
    const targetVal = target[key];
    const refVal = refSource ? refSource[key] : undefined;

    if (contractVal && typeof contractVal === 'object') {
      errors.push(...validateStructure(targetVal, contractVal, refVal, subPath));
    } else {
      errors.push(...validateLeafNode(subPath, targetVal, refVal));
    }
  }

  // Guard: Detect extraneous keys not present in contract
  for (const key of targetKeys) {
    if (!contractKeys.includes(key)) {
      const subPath = currentPath ? `${currentPath}.${key}` : key;
      errors.push(`[${subPath}] Extraneous key not defined in contract`);
    }
  }

  return errors;
}

/**
 * Validates a specific locale against the contract.
 */
export function validateLocaleAgainstContract(localeData, contract, localeName = 'locale') {
  if (!localeData || typeof localeData !== 'object') {
    return {
      isValid: false,
      errors: [`Locale [${localeName}] data must be an object`],
    };
  }

  const errors = validateStructure(localeData, contract, en, localeName);
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates all registered locales against TRANSLATION_CONTRACT.
 */
export function validateAllLocales() {
  const registered = [
    { name: 'en', data: en },
    { name: 'ru', data: ru },
  ];

  const allErrors = [];
  for (const { name, data } of registered) {
    const result = validateLocaleAgainstContract(data, TRANSLATION_CONTRACT, name);
    if (!result.isValid) {
      allErrors.push(...result.errors.map(err => `${name}: ${err}`));
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}
