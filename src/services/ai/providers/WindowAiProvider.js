/**
 * WindowAiProvider: Uses Chrome/Edge built-in Prompt API (global LanguageModel or window.ai).
 * Offloads inference to the browser/OS with zero download cost.
 */

import { AIProvider } from '../AIProvider.js';
import {
  PROVIDER_IDS,
  LEITPUNKT_COVERAGE_SCHEMA,
  SENTENCE_GRAMMAR_SCHEMA,
  FEEDBACK_POLISH_SCHEMA
} from '../types.js';
import { extractAndParseLLMJson } from '../../schreiben/webLlmJsonRepair.js';
import { buildArbiterPrompt } from '../../schreiben/grading/stage2Leitpunkte.js';
import { buildGrammarPrompt } from '../../schreiben/grading/stage3Grammar.js';
import { assembleDeterministicFeedback } from '../../schreiben/grading/stage4Feedback.js';

export class WindowAiProvider extends AIProvider {
  constructor() {
    super(PROVIDER_IDS.WINDOW_AI, 'Browser-KI (Prompt API)');
  }

  async isAvailable() {
    try {
      if (typeof globalThis !== 'undefined' && globalThis.LanguageModel) {
        if (typeof globalThis.LanguageModel.availability === 'function') {
          const avail = await globalThis.LanguageModel.availability();
          return avail === 'readily' || avail === 'after-download';
        }
        if (typeof globalThis.LanguageModel.capabilities === 'function') {
          const caps = await globalThis.LanguageModel.capabilities();
          return caps?.available === 'readily' || caps?.available === 'after-download';
        }
        return typeof globalThis.LanguageModel.create === 'function';
      }
      if (typeof window !== 'undefined' && window.ai?.languageModel) {
        if (typeof window.ai.languageModel.capabilities === 'function') {
          const caps = await window.ai.languageModel.capabilities();
          return caps?.available === 'readily' || caps?.available === 'after-download';
        }
        return typeof window.ai.languageModel.create === 'function';
      }
      return false;
    } catch {
      return false;
    }
  }

  async createSession(options = {}) {
    if (typeof globalThis !== 'undefined' && globalThis.LanguageModel?.create) {
      return await globalThis.LanguageModel.create(options);
    }
    if (typeof window !== 'undefined' && window.ai?.languageModel?.create) {
      return await window.ai.languageModel.create(options);
    }
    throw new Error('Prompt API LanguageModel is not accessible');
  }

  async executePrompt(promptText, schema = null, timeoutMs = 15000) {
    const session = await this.createSession(schema ? { responseConstraint: schema } : {});
    try {
      const promptPromise = session.prompt(promptText);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Prompt API timeout')), timeoutMs)
      );
      const response = await Promise.race([promptPromise, timeoutPromise]);
      return schema ? extractAndParseLLMJson(response) : response;
    } finally {
      if (typeof session.destroy === 'function') {
        session.destroy();
      }
    }
  }

  async classifyCoverage(lp, relevantSentences) {
    const lpLabel = typeof lp === 'string' ? lp : (lp?.label || lp?.id || '');
    const prompt = buildArbiterPrompt(lpLabel, relevantSentences);
    try {
      const parsed = await this.executePrompt(prompt, LEITPUNKT_COVERAGE_SCHEMA);
      return { coverage: parsed?.coverage || 'fallback' };
    } catch (err) {
      console.warn('[WindowAiProvider] Coverage arbitration error:', err?.message || err);
      return { coverage: 'fallback' };
    }
  }

  async proposeGrammarCandidates(sentence) {
    const trimmed = String(sentence || '').trim();
    if (!trimmed) return [];
    const prompt = buildGrammarPrompt(trimmed);
    try {
      const parsed = await this.executePrompt(prompt, SENTENCE_GRAMMAR_SCHEMA);
      return Array.isArray(parsed?.errors) ? parsed.errors : [];
    } catch (err) {
      console.warn('[WindowAiProvider] Grammar proposition error:', err?.message || err);
      return [];
    }
  }

  async polishFeedback(facts = {}) {
    const templateText = assembleDeterministicFeedback(facts);
    const prompt = `Rewrite these German A1 exam feedback facts into 2 motivating sentences: "${templateText}". Output JSON: {"feedback": "..."}`;
    try {
      const parsed = await this.executePrompt(prompt, FEEDBACK_POLISH_SCHEMA);
      return String(parsed?.feedback || '').trim() || templateText;
    } catch {
      return templateText;
    }
  }
}
