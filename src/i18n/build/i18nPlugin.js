import { validateAllLocales } from '../contractValidator.js';

/**
 * Vite plugin that validates all translation files against the contract at build time.
 * If any locale deviates from the contract, the build aborts immediately.
 */
export function i18nContractValidatorPlugin() {
  return {
    name: 'vite-plugin-i18n-contract-validator',
    buildStart() {
      const validation = validateAllLocales();
      if (!validation.isValid) {
        const errorList = validation.errors.map(err => `  - ${err}`).join('\n');
        throw new Error(
          `\n[i18n-contract-validator] Build failed: translation contract violation detected:\n${errorList}\n`
        );
      }
    },
  };
}
