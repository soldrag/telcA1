import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateExamMetadata } from './validators/examValidator.js';
import { validateQuestion } from './validators/questionValidator.js';

export function validateExamSeed(exam, questions, options = {}) {
  const metaResult = validateExamMetadata(exam, questions);
  const errors = [...metaResult.errors];
  const warnings = [...metaResult.warnings];

  if (!Array.isArray(questions)) {
    return { valid: false, errors: [...errors, 'Questions must be an array.'], warnings };
  }

  const seenNumbers = new Set();
  for (const q of questions) {
    if (seenNumbers.has(q.question_number)) {
      errors.push(`Duplicate question_number '${q.question_number}' in exam '${exam.id}'.`);
    }
    seenNumbers.add(q.question_number);

    const qResult = validateQuestion(q, exam, options);
    errors.push(...qResult.errors);
    warnings.push(...qResult.warnings);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateAllSeeds(seedData, options = {}) {
  const allErrors = [];
  const allWarnings = [];
  const seenQuestionIds = new Set();
  const seenExamIds = new Set();

  for (const exam of seedData.exams || []) {
    if (seenExamIds.has(exam.id)) {
      allErrors.push(`Duplicate exam ID '${exam.id}' found.`);
    }
    seenExamIds.add(exam.id);

    const examQuestions = (seedData.questions || []).filter(q => q.exam_id === exam.id);
    const result = validateExamSeed(exam, examQuestions, options);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);

    for (const q of examQuestions) {
      if (seenQuestionIds.has(q.id)) {
        allErrors.push(`Global duplicate question ID '${q.id}' detected.`);
      }
      seenQuestionIds.add(q.id);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    examsCount: (seedData.exams || []).length,
    questionsCount: (seedData.questions || []).length
  };
}

async function runCli() {
  const targetArg = process.argv[2];
  console.log('\n🔍 telc A1 Exam Seed Validator\n' + '='.repeat(40));

  if (targetArg) {
    const fullPath = path.resolve(process.cwd(), targetArg);
    console.log(`Checking file: ${targetArg}`);
    const module = await import(pathToFileURL(fullPath).href);
    const result = validateExamSeed(module.exam, module.questions);
    reportResults([result]);
  } else {
    console.log('Checking all registered seeds in server/seed-data.js...');
    const { seedData } = await import('../seed-data.js');
    const result = validateAllSeeds(seedData);
    reportAllResults(result);
  }
}

function reportResults(results) {
  let totalErrors = 0;
  for (const r of results) {
    totalErrors += r.errors.length;
    r.errors.forEach(e => console.error(`  ❌ ERROR: ${e}`));
    r.warnings.forEach(w => console.warn(`  ⚠️  WARN:  ${w}`));
  }
  finishReport(totalErrors);
}

function reportAllResults(summary) {
  console.log(`Checked ${summary.examsCount} exams, ${summary.questionsCount} questions.`);
  summary.errors.forEach(e => console.error(`  ❌ ERROR: ${e}`));
  summary.warnings.forEach(w => console.warn(`  ⚠️  WARN:  ${w}`));
  finishReport(summary.errors.length, summary.warnings.length);
}

function finishReport(errorCount, warnCount = 0) {
  console.log('='.repeat(40));
  if (errorCount > 0) {
    console.error(`💥 Validation failed with ${errorCount} error(s) and ${warnCount} warning(s).`);
    process.exit(1);
  } else {
    console.log(`✅ Validation passed successfully with 0 errors (${warnCount} non-fatal warning(s)).\n`);
    process.exit(0);
  }
}

if (process.argv[1] && process.argv[1].endsWith('validate-seeds.js')) {
  runCli().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}
