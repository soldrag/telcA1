/**
 * Registry and strategy selector for AIProviders.
 * Picks the configured primary provider (Micro-Ranker) when available, otherwise the limited rule-based mode.
 * A developer override (localStorage) may force a registered provider, e.g. `none` for the limited mode.
 */

import { PROVIDER_IDS } from './types.js';
import { NoneProvider } from './providers/NoneProvider.js';
import { MicroRankerProvider } from './providers/MicroRankerProvider.js';
import { getPrimaryAiProviderId } from '../../config/aiConfig.js';

const STORAGE_OVERRIDE_KEY = 'telc_ai_provider_override';

export class AIProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.activeProviderId = null;
    this.register(new MicroRankerProvider());
    this.register(new NoneProvider());
  }

  register(provider) {
    if (!provider?.id) return;
    this.providers.set(provider.id, provider);
  }

  getProvider(id) {
    return this.providers.get(id) || this.providers.get(PROVIDER_IDS.NONE);
  }

  getSavedOverride() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(STORAGE_OVERRIDE_KEY);
    } catch {
      return null;
    }
  }

  async detectBestAvailableProvider() {
    const priority = [this.getSavedOverride(), getPrimaryAiProviderId()];
    for (const id of priority) {
      const provider = id && this.providers.get(id);
      if (provider && await provider.isAvailable()) return provider;
    }
    return this.getProvider(PROVIDER_IDS.NONE);
  }

  async getActiveProvider() {
    if (this.activeProviderId && this.providers.has(this.activeProviderId)) {
      return this.providers.get(this.activeProviderId);
    }
    const best = await this.detectBestAvailableProvider();
    this.activeProviderId = best.id;
    return best;
  }
}

export const aiProviderRegistry = new AIProviderRegistry();
