/**
 * Registry and strategy selector for AIProviders.
 * Auto-detects in priority order: window_ai -> client_webgpu -> none.
 * Supports manual override with localStorage persistence.
 */

import { PROVIDER_IDS } from './types.js';
import { NoneProvider } from './providers/NoneProvider.js';
import { WindowAiProvider } from './providers/WindowAiProvider.js';
import { ClientWebGpuProvider } from './providers/ClientWebGpuProvider.js';
import { isWebGPUSupported } from '../../utils/webGpuSupport.js';

const STORAGE_OVERRIDE_KEY = 'telc_ai_provider_override';

function reportDetectionTelemetry(data) {
  try {
    if (typeof fetch === 'function') {
      fetch('/api/debug/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'AI_DETECT', message: 'Provider detection', data })
      }).catch(() => {});
    }
  } catch {}
}

export class AIProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.activeProviderId = null;
    this.initializeDefaults();
  }

  initializeDefaults() {
    this.register(new WindowAiProvider());
    this.register(new ClientWebGpuProvider());
    this.register(new NoneProvider());
  }

  register(provider) {
    if (!provider?.id) return;
    this.providers.set(provider.id, provider);
  }

  getProvider(id) {
    return this.providers.get(id) || this.providers.get(PROVIDER_IDS.NONE);
  }

  getAllProviders() {
    return Array.from(this.providers.values());
  }

  getSavedOverride() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(STORAGE_OVERRIDE_KEY);
      }
    } catch {
      return null;
    }
    return null;
  }

  async detectBestAvailableProvider() {
    const override = this.getSavedOverride();
    if (override && this.providers.has(override)) {
      const overrideProvider = this.providers.get(override);
      const isAvail = await overrideProvider.isAvailable();
      if (isAvail) return overrideProvider;
    }

    let selected = null;
    const priority = [PROVIDER_IDS.WINDOW_AI, PROVIDER_IDS.CLIENT_WEBGPU, PROVIDER_IDS.NONE];
    for (const id of priority) {
      const p = this.providers.get(id);
      if (p) {
        const avail = await p.isAvailable();
        if (avail) {
          selected = p;
          break;
        }
      }
    }

    const result = selected || this.getProvider(PROVIDER_IDS.NONE);
    reportDetectionTelemetry({
      isSecureContext: typeof window !== 'undefined' ? window.isSecureContext : null,
      protocol: typeof window !== 'undefined' ? window.location?.protocol : null,
      hostname: typeof window !== 'undefined' ? window.location?.hostname : null,
      hasNavigatorGpu: typeof navigator !== 'undefined' && Boolean(navigator.gpu),
      hasWebGpuAdapter: isWebGPUSupported(),
      hasLanguageModel: Boolean(globalThis.LanguageModel || (typeof window !== 'undefined' && window.ai?.languageModel)),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      selectedProvider: result.id
    });
    return result;
  }

  async getActiveProvider() {
    if (this.activeProviderId && this.providers.has(this.activeProviderId)) {
      return this.providers.get(this.activeProviderId);
    }
    const best = await this.detectBestAvailableProvider();
    this.activeProviderId = best.id;
    return best;
  }

  setActiveProvider(providerId) {
    if (this.providers.has(providerId)) {
      this.activeProviderId = providerId;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_OVERRIDE_KEY, providerId);
        }
      } catch {}
    }
  }

  clearOverride() {
    this.activeProviderId = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_OVERRIDE_KEY);
      }
    } catch {}
  }
}

export const aiProviderRegistry = new AIProviderRegistry();
