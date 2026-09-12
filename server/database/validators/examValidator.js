const VALID_TEST_TYPES = new Set(['lesen', 'schreiben', 'hoeren', 'sprechen']);

function validateRequiredStrings(exam, errors) {
  const stringFields = ['id', 'title', 'subtitle', 'description'];
  for (const field of stringFields) {
    if (typeof exam[field] !== 'string' || exam[field].trim() === '') {
      errors.push(`Exam field '${field}' must be a non-empty string.`);
    }
  }
}

function validateNumericFields(exam, errors) {
  const numericFields = [
    { field: 'time_limit_minutes', min: 1, max: 120 },
    { field: 'total_questions', min: 1, max: 50 },
    { field: 'pass_score', min: 1, max: 50 }
  ];

  for (const { field, min, max } of numericFields) {
    const val = exam[field];
    if (typeof val !== 'number' || !Number.isInteger(val) || val < min || val > max) {
      errors.push(`Exam '${field}' must be an integer between ${min} and ${max}.`);
    }
  }

  const testType = exam.test_type || 'lesen';
  const effectiveMaxScore = exam.max_score || (testType === 'schreiben' ? 15 : exam.total_questions);

  if (typeof exam.pass_score === 'number' && typeof effectiveMaxScore === 'number') {
    if (exam.pass_score > effectiveMaxScore) {
      errors.push(
        `Exam 'pass_score' (${exam.pass_score}) cannot exceed max score (${effectiveMaxScore}).`
      );
    }
  }
}

function validateTestTypeAndSort(exam, errors) {
  const testType = exam.test_type || 'lesen';
  if (!VALID_TEST_TYPES.has(testType)) {
    errors.push(`Exam 'test_type' '${testType}' is invalid. Allowed: ${[...VALID_TEST_TYPES].join(', ')}.`);
  }

  if (exam.sort_order !== undefined) {
    if (typeof exam.sort_order !== 'number' || !Number.isInteger(exam.sort_order) || exam.sort_order < 1) {
      errors.push(`Exam 'sort_order' must be a positive integer.`);
    }
  }
}

export function validateExamMetadata(exam, questions = []) {
  const errors = [];
  const warnings = [];

  if (!exam || typeof exam !== 'object') {
    return { valid: false, errors: ['Exam object is missing or not an object.'], warnings: [] };
  }

  validateRequiredStrings(exam, errors);
  validateNumericFields(exam, errors);
  validateTestTypeAndSort(exam, errors);

  if (Array.isArray(questions)) {
    if (questions.length !== exam.total_questions) {
      errors.push(
        `Question count mismatch in '${exam.id}': exam declares ${exam.total_questions} questions, but found ${questions.length}.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
