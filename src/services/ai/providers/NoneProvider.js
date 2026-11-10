/**
 * NoneProvider: the limited mode. The letter is read without the embedding model (reference alignment).
 */

import { AIProvider } from '../AIProvider.js';
import { PROVIDER_IDS } from '../types.js';

export class NoneProvider extends AIProvider {
  constructor() {
    super(PROVIDER_IDS.NONE, 'Regelbasiert (Eingeschränkter Modus)');
  }

  async isAvailable() {
    return true;
  }
}
