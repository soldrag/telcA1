import { LocalStorageAttemptStorage } from './localStorageAttemptStorage.js';

/** The app's attempt storage: the browser's localStorage. */
export const attemptStorage = new LocalStorageAttemptStorage();
