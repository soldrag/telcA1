/**
 * Client-side bridge for managing the dedicated grading Web Worker.
 * Ensures the worker is completely terminated after evaluation to free 100% OS memory.
 */

import { gradeSchreibenSubmission } from '../gradingPipeline.js';

export function isWorkerSupported() {
  return typeof window !== 'undefined' && typeof window.Worker === 'function';
}

function spawnGradingWorker() {
  return new Worker(new URL('./gradingWorker.js', import.meta.url), { type: 'module' });
}

export function gradeInWorker({
  userText = '',
  question = {},
  options = {},
  onProgress = null,
  timeoutMs = 90000
}) {
  return new Promise((resolve, reject) => {
    let worker = null;
    let timer = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (worker) {
        worker.terminate();
        worker = null;
      }
    };

    try {
      worker = spawnGradingWorker();
    } catch (err) {
      return reject(err);
    }

    const requestId = 'req_' + Math.random().toString(36).slice(2, 9);

    timer = setTimeout(() => {
      cleanup();
      reject(new Error('Bewertung im Hintergrund-Thread hat das Zeitlimit überschritten'));
    }, timeoutMs);

    worker.onmessage = (event) => {
      const { id, type, text, progress, result, error } = event.data || {};
      if (id !== requestId) return;

      if (type === 'PROGRESS') {
        onProgress?.(text, progress);
      } else if (type === 'SUCCESS') {
        cleanup();
        resolve(result);
      } else if (type === 'ERROR') {
        cleanup();
        reject(new Error(error || 'Fehler im Hintergrund-Worker'));
      }
    };

    worker.onerror = (errEvent) => {
      const msg = errEvent?.message || 'Unerwarteter Fehler im Web Worker';
      cleanup();
      reject(new Error(msg));
    };

    worker.postMessage({
      id: requestId,
      type: 'GRADE_REQUEST',
      payload: { userText, question, options }
    });
  });
}

export async function gradeSchreibenWithWorker({
  userText = '',
  question = {},
  options = {},
  onProgress = null
}) {
  if (!isWorkerSupported()) {
    return gradeSchreibenSubmission({ userText, question, options, onProgress });
  }

  try {
    return await gradeInWorker({ userText, question, options, onProgress });
  } catch (err) {
    console.warn('[WorkerClient] Worker execution failed, falling back to limited mode:', err);
    return gradeSchreibenSubmission({
      userText,
      question,
      options: { ...options, forceLimitedMode: true },
      onProgress
    });
  }
}
