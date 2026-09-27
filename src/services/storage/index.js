import { LocalStorageAttemptStorage } from './localStorageAttemptStorage.js';
import { MemoryAttemptStorage } from './memoryAttemptStorage.js';

export { AttemptStorageInterface } from './attemptStorage.interface.js';
export { LocalStorageAttemptStorage } from './localStorageAttemptStorage.js';
export { MemoryAttemptStorage } from './memoryAttemptStorage.js';

export function createAttemptStorage(type = 'local', options = {}) {
  switch (type) {
    case 'local':
    case 'localStorage':
      return new LocalStorageAttemptStorage(options.storageKey);
    case 'memory':
      return new MemoryAttemptStorage(options.initialAttempts);
    default:
      console.warn(`[Storage] Unknown storage type "${type}", falling back to LocalStorageAttemptStorage`);
      return new LocalStorageAttemptStorage(options.storageKey);
  }
}

/**
 * Singleton attempt storage instance.
 * Default is browser LocalStorage ('local').
 */
export const attemptStorage = createAttemptStorage('local');
