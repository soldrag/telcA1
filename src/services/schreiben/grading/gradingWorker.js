/**
 * Dedicated Web Worker for Schreiben Teil 2 grading.
 * Runs in isolated thread, computes embeddings/LLM grading, and streams progress.
 */

import { gradeSchreibenSubmission } from '../gradingPipeline.js';

self.onmessage = async (event) => {
  const { id, type, payload } = event.data || {};
  if (type !== 'GRADE_REQUEST') return;

  const { userText, question, options } = payload || {};

  try {
    const result = await gradeSchreibenSubmission({
      userText,
      question,
      options,
      onProgress: (text, progress) => {
        self.postMessage({ id, type: 'PROGRESS', text, progress });
      }
    });

    self.postMessage({ id, type: 'SUCCESS', result });
  } catch (err) {
    self.postMessage({
      id,
      type: 'ERROR',
      error: err?.message || String(err)
    });
  }
};
