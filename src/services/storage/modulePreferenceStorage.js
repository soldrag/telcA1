import { TEST_TYPES } from '../../../shared/testTypes.js';

/**
 * @typedef {object} ModulePreference
 * @property {() => string} read   the module to open with: the last one chosen, or the default
 * @property {(moduleId: string) => void} save
 */

const STORAGE_KEY = 'telc_active_module';
const DEFAULT_MODULE = 'lesen';

// A module that is not (or no longer) playable must not open on start: the home screen would show nothing to take.
function isPlayableModule(moduleId) {
  return TEST_TYPES.some((type) => type.id === moduleId && type.status === 'active');
}

/** The chosen module survives a reload; private mode or blocked storage falls back to the default module. */
export const localModulePreference = {
  read() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return isPlayableModule(stored) ? stored : DEFAULT_MODULE;
    } catch {
      return DEFAULT_MODULE;
    }
  },
  save(moduleId) {
    if (!isPlayableModule(moduleId)) return;
    try { localStorage.setItem(STORAGE_KEY, moduleId); } catch { /* private mode: keep it in memory only */ }
  },
};
