/**
 * Subject–verb agreement: the finite verb's person and number match the subject
 * ("Wie viel kostet der Kurs", not "kosten der Kurs"). Homographs are resolved leniently: agreement holds
 * if any lexicon reading of the pronoun and of the verb form agrees.
 */
import { realizedFeatures } from '../analysis/nounPhraseFeatures.js';

const FINITE_POS = new Set(['VERB_FIN', 'VERB_MOD']);
const ADVERBIAL_CATEGORIES = new Set(['duration', 'month', 'weekday', 'season', 'daytime']);
const clean = (raw = '') => raw.replace(/[.,;:!?]+$/, '');

function subjectReadings(phrase, lexicon) {
  if (phrase.pronoun) {
    return lexicon.lookup(phrase.pronoun.lower).filter((e) => e.pos === 'PRON_SUBJ').map((e) => ({ person: e.person?.[0], number: e.number }));
  }
  const nominative = realizedFeatures(phrase).filter((f) => f.case === 'NOM');
  return nominative.map((f) => ({ person: 3, number: f.slot === 'pl' ? 'pl' : 'sg' }));
}

function isNominalSubject(phrase) {
  if (!phrase.head || ADVERBIAL_CATEGORIES.has(phrase.head.analysis.entry.category)) return false;
  return realizedFeatures(phrase).some((f) => f.case === 'NOM');
}

function findSubject(analysis, clause) {
  return analysis.phrases.find((p) => p.start >= clause.start && p.end <= clause.end && !p.governor && !p.isCalendar
    && (p.pronoun ? p.pronoun.pos === 'PRON_SUBJ' : isNominalSubject(p)));
}

function agrees(verbReadings, subjects) {
  return subjects.some((s) => verbReadings.some((v) => v.person?.includes(s.person) && (!v.number || !s.number || v.number === s.number)));
}

function checkClause(analysis, clause, context, previous) {
  const verb = analysis.tokens[clause.finiteIndex];
  const startsWithCoordinator = analysis.tokens[clause.start]?.pos === 'KONJ_COORD';
  if (!verb || (startsWithCoordinator && previous?.finiteIndex === -1)) return null;
  const subject = findSubject(analysis, clause);
  const subjects = subject ? subjectReadings(subject, context.lexicon) : [];
  const verbReadings = context.lexicon.lookup(verb.lower).filter((e) => FINITE_POS.has(e.pos));
  if (!subjects.length || !verbReadings.length || agrees(verbReadings, subjects)) return null;
  const [form] = context.lexicon.findForms((e) => FINITE_POS.has(e.pos) && e.lemma === verb.lemma && agrees([e], subjects));
  if (!form) return null;
  const subjectText = analysis.tokens.slice(subject.start, subject.end + 1).map((t) => clean(t.raw)).join(' ');
  return {
    category: 'agreement',
    code: 'ERR_SUBJECT_VERB_AGREEMENT',
    original: clean(verb.raw),
    correction: form,
    explanation: `Subjekt-Verb-Kongruenz: Zum Subjekt „${subjectText}“ passt die Verbform „${form}“ (nicht „${clean(verb.raw)}“).`,
  };
}

export const subjectVerbAgreementRule = {
  id: 'subjectVerbAgreement',
  check(analysis, context) {
    return analysis.clauses.map((clause, i) => checkClause(analysis, clause, context, analysis.clauses[i - 1])).filter(Boolean);
  },
};
