/**
 * Vorfeld order in main clauses (Verbzweitstellung): one constituent before the finite verb,
 * no resumptive subject pronoun after a subject noun phrase, and a subject after a fronted adverbial.
 */

const ADVERBIAL_NOUN_CATEGORIES = new Set(['duration', 'month', 'weekday', 'season', 'daytime']);

/** A third-person pronoun resuming a subject noun phrase ("Mein Mann er kommt"); time phrases are not subjects. */
function isResumptivePronoun(nounPhrase, pronoun) {
  const head = nounPhrase.tokens[nounPhrase.tokens.length - 1];
  return pronoun.tokens[0].person?.includes(3) && !ADVERBIAL_NOUN_CATEGORIES.has(head?.category);
}

function doubledSubjectError(constituents, finVerb) {
  const [first, second] = constituents;
  if (constituents.length !== 2 || first.type !== 'NP' || second.type !== 'SUBJECT_PRON') return null;
  if (!isResumptivePronoun(first, second)) return null;
  return {
    category: 'syntax',
    code: 'ERR_DOUBLED_SUBJECT',
    original: `${first.rawText} ${second.rawText} ${finVerb.raw}`,
    correction: `${first.rawText} ${finVerb.raw}`,
    explanation: `Doppeltes Subjekt: „${first.rawText}“ ist schon das Subjekt, das Pronomen „${second.rawText}“ entfällt: „${first.rawText} ${finVerb.raw}“.`,
  };
}

function overcrowdedVorfeldError(constituents, finVerb) {
  if (constituents.length < 2) return null;
  const firstConst = constituents[0].rawText;
  const restBeforeVerb = constituents.slice(1).map((c) => c.rawText).join(' ');
  return {
    category: 'syntax',
    code: 'ERR_V2_OVERCROWDED_VORFELD',
    original: `${firstConst} ${restBeforeVerb} ${finVerb.raw}`,
    correction: `${firstConst} ${finVerb.raw} ${restBeforeVerb}`,
    explanation: `Verbzweitstellung verletzt: Nach der Angabe „${firstConst}“ steht das konjugierte Verb an Position 2: „${firstConst} ${finVerb.raw} ${restBeforeVerb}“`,
  };
}

function missingSubjectError(constituents, finVerb, mittelfeld) {
  if (constituents.length !== 1 || !['PP', 'ADVP'].includes(constituents[0].type)) return null;
  if (mittelfeld.some((t) => t.pos === 'PRON_SUBJ' || t.pos === 'NOUN')) return null;
  return {
    category: 'syntax',
    code: 'ERR_MISSING_SUBJECT_INVERSION',
    original: `${constituents[0].rawText} ${finVerb.raw}`,
    correction: `${constituents[0].rawText} ${finVerb.raw} [Subjekt]`,
    explanation: `Inversion: Nach „${constituents[0].rawText} ${finVerb.raw}“ fehlt das Subjekt im Mittelfeld.`,
  };
}

export function checkVorfeldOrder(constituents = [], finVerb = {}, mittelfeld = []) {
  const error = doubledSubjectError(constituents, finVerb)
    || overcrowdedVorfeldError(constituents, finVerb)
    || missingSubjectError(constituents, finVerb, mittelfeld);
  return error ? [error] : [];
}
