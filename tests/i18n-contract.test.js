import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAllLocales,
  validateLocaleAgainstContract,
} from '../src/i18n/contractValidator.js';
import { TRANSLATION_CONTRACT } from '../src/i18n/contracts/translationContract.js';
import { en } from '../src/i18n/locales/en.js';
import { ru } from '../src/i18n/locales/ru.js';
import {
  detectInitialLanguage,
  persistLanguage,
  STORAGE_KEY,
  DEFAULT_LANGUAGE,
} from '../src/i18n/languageDetector.js';
import { i18nContractValidatorPlugin } from '../src/i18n/build/i18nPlugin.js';

describe('i18n Translation Contract Validation', () => {
  it('validates that all registered locales satisfy the translation contract', () => {
    const result = validateAllLocales();
    assert.equal(result.isValid, true, `Contract violations: \n${result.errors.join('\n')}`);
    assert.equal(result.errors.length, 0);
  });

  it('fails validation when a required contract key is missing', () => {
    const brokenLocale = JSON.parse(JSON.stringify(en));
    delete brokenLocale.header.simulatorTitle;

    const result = validateLocaleAgainstContract(brokenLocale, TRANSLATION_CONTRACT, 'broken');
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some(e => e.includes('header.simulatorTitle')));
  });

  it('fails validation when an extraneous unknown key is present', () => {
    const rogueLocale = JSON.parse(JSON.stringify(en));
    rogueLocale.header.unknownExtraKey = 'test';

    const result = validateLocaleAgainstContract(rogueLocale, TRANSLATION_CONTRACT, 'rogue');
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some(e => e.includes('Extraneous key not defined in contract')));
  });

  it('fails validation when a template placeholder is missing', () => {
    const brokenPlaceholderLocale = JSON.parse(JSON.stringify(en));
    brokenPlaceholderLocale.header.answeredProgress = 'Answered static';

    const result = validateLocaleAgainstContract(brokenPlaceholderLocale, TRANSLATION_CONTRACT, 'broken_placeholder');
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some(e => e.includes('Missing expected placeholder(s)')));
  });

  it('validates Russian locale specifically satisfies all contract paths', () => {
    const result = validateLocaleAgainstContract(ru, TRANSLATION_CONTRACT, 'ru');
    assert.equal(result.isValid, true, `Russian locale errors: \n${result.errors.join('\n')}`);
  });

  it('runs Vite plugin buildStart hook without error when contracts pass', () => {
    const plugin = i18nContractValidatorPlugin();
    assert.doesNotThrow(() => {
      plugin.buildStart();
    });
  });
});

describe('Language Detector & Preference Resolution', () => {
  const mockStorage = new Map();

  beforeEach(() => {
    mockStorage.clear();
    global.localStorage = {
      getItem: (key) => mockStorage.get(key) ?? null,
      setItem: (key, val) => mockStorage.set(key, String(val)),
      clear: () => mockStorage.clear(),
    };
    global.window = {
      navigator: {
        languages: ['en-US', 'en'],
        language: 'en-US',
      },
    };
  });

  it('defaults to English when browser language is English', () => {
    global.window.navigator.languages = ['en-US'];
    assert.equal(detectInitialLanguage(), 'en');
  });

  it('detects Russian from browser language preferences', () => {
    global.window.navigator.languages = ['ru-RU', 'ru'];
    assert.equal(detectInitialLanguage(), 'ru');
  });

  it('falls back to default English for unsupported languages like German', () => {
    global.window.navigator.languages = ['de-DE', 'de'];
    assert.equal(detectInitialLanguage(), 'en');
  });

  it('prioritizes saved localStorage preference over browser preference', () => {
    global.window.navigator.languages = ['ru-RU'];
    persistLanguage('en');
    assert.equal(detectInitialLanguage(), 'en');
  });
});
