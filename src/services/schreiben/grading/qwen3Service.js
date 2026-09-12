/**
 * Client-side Qwen3-0.6B service using @mlc-ai/web-llm.
 * Runs micro-tasks in browser via WebGPU with /no_think disabled reasoning tokens.
 */

import { QWEN3_MODEL_ID } from './types.js';
import { extractAndParseLLMJson } from '../webLlmJsonRepair.js';

let qwenEngine = null;
let isInitializing = false;

export function appendNoThinkDirective(prompt = '') {
  const trimmed = (prompt || '').trim();
  if (trimmed.includes('/no_think')) return trimmed;
  return `${trimmed}\n/no_think`;
}

export async function initQwen3(onProgress = null) {
  if (qwenEngine) return qwenEngine;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 50));
    }
    return qwenEngine;
  }

  isInitializing = true;
  try {
    const webllm = await import('@mlc-ai/web-llm');
    qwenEngine = await webllm.CreateMLCEngine(QWEN3_MODEL_ID, {
      initProgressCallback: (report) => {
        if (!onProgress || !report) return;
        const pct = report.progress ? ` (${Math.round(report.progress * 100)}%)` : '';
        onProgress(`Lade Qwen3-0.6B: ${report.text || 'Initialisiere'}${pct}`, report.progress);
      }
    });
    return qwenEngine;
  } finally {
    isInitializing = false;
  }
}

export async function executeQwen3Prompt({
  prompt = '',
  schema = null,
  maxTokens = 128,
  timeoutMs = 12000,
  engine = null
}) {
  const activeEngine = engine || await initQwen3();
  const formattedPrompt = appendNoThinkDirective(prompt);

  const requestOptions = {
    messages: [{ role: 'user', content: formattedPrompt }],
    temperature: 0,
    max_tokens: maxTokens
  };

  if (schema) {
    requestOptions.response_format = {
      type: 'json_object',
      schema: typeof schema === 'string' ? schema : JSON.stringify(schema)
    };
  }

  const callPromise = activeEngine.chat.completions.create(requestOptions);
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Qwen3 request timed out')), timeoutMs)
  );

  const response = await Promise.race([callPromise, timeoutPromise]);
  const content = response?.choices?.[0]?.message?.content || '';
  return schema ? extractAndParseLLMJson(content) : content;
}

export async function unloadQwen3() {
  if (qwenEngine) {
    try {
      if (typeof qwenEngine.unload === 'function') {
        await qwenEngine.unload();
      }
    } catch (err) {
      console.warn('[Qwen3] Unload warning:', err);
    }
  }
  qwenEngine = null;
  isInitializing = false;
}

export function resetQwen3Service() {
  unloadQwen3().catch(() => {});
  qwenEngine = null;
  isInitializing = false;
}

