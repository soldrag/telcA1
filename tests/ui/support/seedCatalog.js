import { seedData } from '../../../server/seed-data.js';

/**
 * @typedef {{ id: string, testType: string, shortTitle: string, totalQuestions: number }} SeedVariant
 * @returns {SeedVariant[]} the variants of one module as the app ships them
 */
export function listVariants(testType) {
  return seedData.exams
    .map((exam) => ({
      id: exam.id,
      testType: exam.test_type || 'lesen',
      shortTitle: exam.title.split('—').pop().trim(),
      totalQuestions: exam.total_questions,
    }))
    .filter((variant) => variant.testType === testType);
}
