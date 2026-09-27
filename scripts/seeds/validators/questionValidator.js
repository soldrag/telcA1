function normalizeText(text) {
  return (text || '').replace(/\s+/g, ' ').toLowerCase().trim();
}

function validateCommonFields(q, examId, errors) {
  if (typeof q.id !== 'string' || !q.id.trim()) errors.push('Question ID must be a non-empty string.');
  if (q.exam_id !== examId) errors.push(`Question exam_id '${q.exam_id}' does not match exam '${examId}'.`);
  if (![1, 2, 3].includes(q.teil)) errors.push(`Question teil '${q.teil}' must be 1, 2, or 3.`);
  if (typeof q.question_number !== 'number' || q.question_number < 1) {
    errors.push('Question question_number must be a positive integer.');
  }
}

function validateExplanationsAndVocab(q, errors) {
  const langKeys = ['explanation_ru', 'explanation_en', 'explanation_de'];
  for (const k of langKeys) {
    if (typeof q[k] !== 'string' || !q[k].trim()) {
      errors.push(`Question '${q.id}' missing required explanation '${k}'.`);
    }
  }

  if (!Array.isArray(q.vocabulary_notes) || q.vocabulary_notes.length === 0) {
    errors.push(`Question '${q.id}' must have a non-empty 'vocabulary_notes' array.`);
  } else {
    for (const v of q.vocabulary_notes) {
      if (!v.word || typeof v.word !== 'string') {
        errors.push(`Question '${q.id}' vocabulary note missing valid 'word'.`);
      }
    }
  }
}

function validateLesenQuestion(q, errors) {
  if (q.teil === 1 || q.teil === 3) {
    if (!['richtig', 'falsch'].includes(q.correct_answer)) {
      errors.push(`Question '${q.id}' Teil ${q.teil} correct_answer must be 'richtig' or 'falsch'.`);
    }
    if (!q.context_body || typeof q.context_body !== 'string') {
      errors.push(`Question '${q.id}' Teil ${q.teil} requires a non-empty 'context_body'.`);
    }
    if (!q.statement || typeof q.statement !== 'string') {
      errors.push(`Question '${q.id}' Teil ${q.teil} requires a non-empty 'statement'.`);
    }
  } else if (q.teil === 2) {
    if (!['a', 'b'].includes(q.correct_answer)) {
      errors.push(`Question '${q.id}' Teil 2 correct_answer must be 'a' or 'b'.`);
    }
    if (!Array.isArray(q.options_json) || q.options_json.length !== 2) {
      errors.push(`Question '${q.id}' Teil 2 options_json must be an array of exactly 2 options.`);
    } else {
      const ids = q.options_json.map(o => o.id);
      if (!ids.includes('a') || !ids.includes('b')) {
        errors.push(`Question '${q.id}' Teil 2 options must have ids 'a' and 'b'.`);
      }
    }
  }
}

function validateSchreibenQuestion(q, errors) {
  if (q.teil === 1) {
    const opts = q.options_json;
    if (!opts || typeof opts !== 'object' || !opts.form_label || !Array.isArray(opts.accepted_answers)) {
      errors.push(`Question '${q.id}' Teil 1 options_json must include 'form_label' and 'accepted_answers' array.`);
    }
  } else if (q.teil === 2) {
    const opts = q.options_json;
    if (!opts || opts.type !== 'essay' || !Array.isArray(opts.leitpunkte) || !opts.sample_solution) {
      errors.push(`Question '${q.id}' Teil 2 options_json must be essay with 'leitpunkte' and 'sample_solution'.`);
    }
  }
}

function checkClueAuthenticity(q, warnings) {
  if (!q.clue_quote || typeof q.clue_quote !== 'string') return;
  const searchable = normalizeText(
    (q.context_body || '') + ' ' + (typeof q.options_json === 'object' ? JSON.stringify(q.options_json) : '')
  );

  const clean = q.clue_quote.replace(/^[„\"']|[“\"']$/g, '');
  const segments = clean.split(/\.{2,}|…/).map(s => normalizeText(s)).filter(s => s.length > 10);
  for (const seg of segments) {
    if (!searchable.includes(seg)) {
      warnings.push(`Question '${q.id}': clue_quote segment "${seg.slice(0, 40)}..." not found verbatim in text.`);
    }
  }
}

export function validateQuestion(q, exam, { strictClues = false } = {}) {
  const errors = [];
  const warnings = [];

  if (!q || typeof q !== 'object') {
    return { valid: false, errors: ['Question is missing or not an object.'], warnings: [] };
  }

  validateCommonFields(q, exam.id, errors);
  validateExplanationsAndVocab(q, errors);

  const testType = exam.test_type || 'lesen';
  if (testType === 'lesen') {
    validateLesenQuestion(q, errors);
    checkClueAuthenticity(q, strictClues ? errors : warnings);
  } else if (testType === 'schreiben') {
    validateSchreibenQuestion(q, errors);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
