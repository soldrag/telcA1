import { gradeSchreibenSubmission } from '../../src/services/schreiben/gradingPipeline.js';

/** The pipeline in the limited mode — what the app grades with where the Micro-Ranker is unavailable. */
export function gradeLetter(text = '', question = {}) {
  return gradeSchreibenSubmission({ userText: text, question, options: { forceLimitedMode: true } });
}

/** The exam evaluator's gradeEssay port, in the limited mode. */
export function gradeEssayLimited({ userText = '', question = {} } = {}) {
  return gradeLetter(userText, question);
}
