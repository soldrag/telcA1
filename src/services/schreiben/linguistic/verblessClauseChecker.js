/**
 * Generic Verbless Clause & Missing Predicate Checker for German A1.
 * Detects questions and declarative clauses lacking a finite verb.
 * Strictly complies with McConnell limits (<= 120 lines, <= 20 lines per function).
 */

const INTERROGATIVE_WORDS = new Set([
  'wie', 'was', 'wo', 'wann', 'warum', 'wer', 'wen', 'wem',
  'wohin', 'woher', 'welche', 'welcher', 'welches'
]);

function isInterrogativeClause(tokens = [], rawText = '') {
  if (rawText.includes('?')) return true;
  const firstWord = (tokens[0]?.lower || '').replace(/^[.,!?;:]+/, '');
  return INTERROGATIVE_WORDS.has(firstWord);
}

function hasAnyVerb(tokens = []) {
  return tokens.some(t =>
    t.pos === 'VERB_FIN' || t.pos === 'VERB_MOD' ||
    t.pos === 'VERB_INF' || t.pos === 'VERB_AUX'
  );
}

function isPermittedAdverbialFragment(tokens = []) {
  if (tokens.length === 0) return true;
  // Permitted fragments: purely prepositional phrases (e.g. "vom 10. bis 17. Juli")
  const permittedPos = new Set(['PREP', 'NUM', 'NOUN', 'DET', 'ADJ', 'KONJ_COO']);
  return tokens.every(t => permittedPos.has(t.pos)) && !tokens.some(t => t.pos === 'PRON_SUBJ');
}

function buildMissingQuestionVerbError(rawText = '', tokens = []) {
  const clean = rawText.trim().replace(/[.,!?;:]+$/, '');
  const firstLower = (tokens[0]?.lower || '').replace(/^[.,!?;:]+/, '');
  const isWieViel = firstLower === 'wie' && tokens[1]?.lower === 'viel';
  const prefix = isWieViel ? `${tokens[0].raw} ${tokens[1].raw}` : (tokens[0]?.raw || '');
  const rest = isWieViel ? tokens.slice(2).map(t => t.raw).join(' ') : tokens.slice(1).map(t => t.raw).join(' ');

  const correction = prefix && rest ? `${prefix} ist ${rest}?` : `${clean} [Verb fehlt]?`;

  return {
    category: 'syntax',
    code: 'ERR_MISSING_PREDICATE_QUESTION',
    original: rawText.trim(),
    correction,
    explanation: 'Im Fragesatz fehlt das finite Verb (z. B. „ist“ oder „kostet“): Ein vollständiger Fragesatz im Deutschen erfordert ein Prädikat.'
  };
}

function buildMissingCopulaError(rawText = '', subjectToken = null) {
  const clean = rawText.trim().replace(/[.,!?;:]+$/, '');
  const isPlural = subjectToken?.number === 'pl' || subjectToken?.lower === 'wir' || subjectToken?.lower === 'sie';
  const copula = isPlural ? 'sind' : 'ist';

  return {
    category: 'syntax',
    code: 'ERR_MISSING_COPULA_VERB',
    original: rawText.trim(),
    correction: `${clean} [Verb: „${copula}“ fehlt]`,
    explanation: `Im Satz fehlt das finite Verb (Kopula „sein“): Im Deutschen kann das Prädikat nicht weggelassen werden (z. B. „... ${copula} ...“).`
  };
}

export function checkVerblessClause(tokens = [], rawText = '') {
  if (!tokens || tokens.length === 0 || hasAnyVerb(tokens)) {
    return null;
  }

  if (isInterrogativeClause(tokens, rawText)) {
    return buildMissingQuestionVerbError(rawText, tokens);
  }

  // Check for subject + complement without verb (Russian/Slavic zero-copula calque)
  const subjIdx = tokens.findIndex(t => t.pos === 'PRON_SUBJ' || (t.pos === 'NOUN' && tokens[0]?.pos === 'DET'));
  const hasComplement = tokens.some((t, i) => i > subjIdx && (t.pos === 'ADJ' || t.pos === 'PREP' || t.pos === 'NOUN'));

  if (subjIdx !== -1 && hasComplement) {
    return buildMissingCopulaError(rawText, tokens[subjIdx]);
  }

  if (isPermittedAdverbialFragment(tokens)) {
    return null;
  }

  return null;
}
