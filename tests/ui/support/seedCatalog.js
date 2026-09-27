import { seedData } from '../../../server/seed-data.js';
import { formatExamName } from '../../../src/utils/examFormat.js';

/**
 * @typedef {{ id: string, testType: string, shortTitle: string, totalQuestions: number } shortTitle — the name the variant grid shows} SeedVariant
 * @returns {SeedVariant[]} the variants of one module as the app ships them
 */
export function listVariants(testType) {
  return seedData.exams
    .map((exam) => ({
      id: exam.id,
      testType: exam.test_type || 'lesen',
      shortTitle: formatExamName(exam.id),
      totalQuestions: exam.total_questions,
    }))
    .filter((variant) => variant.testType === testType);
}
