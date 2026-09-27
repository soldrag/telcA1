/**
 * Verb frame (lexicon `reflexive`, `prepObject`, separable prefixes): a reflexive verb needs its pronoun
 * ("ich mich anmelden"), a prepositional object takes the verb's preposition ("für den Kurs anmelden"),
 * and a separable prefix is not a preposition before the object ("rufen Sie mich an", not "an mich").
 */
import paradigms from '../data/declensionParadigms.json' with { type: 'json' };
import { realizedFeatures } from '../analysis/nounPhraseFeatures.js';
import { spanText, spanToVerb } from './phraseSpan.js';

const REFLEXIVES = paradigms.reflexivePronouns;
const REFLEXIVE_FORMS = new Set(Object.values(REFLEXIVES));
const clean = (raw = '') => raw.replace(/[.,;:!?]+$/, '');
const inClause = (clause) => (p) => p.start >= clause.start && p.end <= clause.end;

function reflexiveFor(tokens, clause, lexicon) {
  const subject = tokens.slice(clause.start, clause.end + 1).find((t) => t.pos === 'PRON_SUBJ');
  const reading = subject ? lexicon.lookup(subject.lower).find((e) => e.pos === 'PRON_SUBJ') : null;
  return REFLEXIVES[`${reading?.person?.[0] ?? 3}:${reading?.number ?? 'sg'}`];
}

function missingReflexive(analysis, clause, lexicon) {
  const verb = clause.lexicalVerb;
  if (!verb?.reflexive) return null;
  const clauseTokens = analysis.tokens.slice(clause.start, clause.end + 1);
  const hasObject = analysis.phrases.filter(inClause(clause)).some((p) => !p.governor && p.head && !p.isCalendar);
  if (hasObject || clauseTokens.some((t) => REFLEXIVE_FORMS.has(t.lower))) return null;
  const pronoun = reflexiveFor(analysis.tokens, clause, lexicon);
  return {
    category: 'rektion',
    code: 'ERR_REFLEXIVE_PRONOUN_MISSING',
    original: clean(verb.raw),
    correction: `${pronoun} ${clean(verb.raw)}`,
    explanation: `Das Verb „sich ${verb.lemma}“ ist reflexiv: „${pronoun} ${clean(verb.raw)}“ (Reflexivpronomen fehlt).`,
  };
}

function isAccusativeDirectionalObject(phrase, lexicon) {
  const prep = lexicon.lookup(phrase.governor.preposition).find((e) => e.pos === 'PREP');
  if (prep?.prepCase !== 'WECHSEL' || !phrase.head) return false;
  const cases = new Set(realizedFeatures(phrase).map((f) => f.case));
  return cases.has('AKK') && !cases.has('DAT');
}

function wrongPrepositionalObject(analysis, clause, lexicon) {
  const allowed = clause.lexicalVerb?.prepObject;
  if (!allowed) return null;
  const phrase = analysis.phrases.filter(inClause(clause))
    .find((p) => p.governor && !p.governor.article && !allowed.includes(p.governor.preposition) && isAccusativeDirectionalObject(p, lexicon));
  if (!phrase) return null;
  const prepIndex = phrase.start - 1;
  const span = spanToVerb(analysis.tokens, { ...phrase, start: prepIndex }, clause);
  const correction = [allowed[0], spanText(analysis.tokens, phrase.start, span.to)].join(' ');
  return {
    category: 'rektion',
    code: 'ERR_VERB_PREPOSITION',
    original: span.text,
    correction,
    explanation: `Präposition bei „${clause.lexicalVerb.lemma}“: Man sagt „${allowed.join('“ oder „')} …“: „${correction}“ (nicht „${span.text}“).`,
  };
}

// "Ich rufe an dich" for "anrufen": the rule needs the separable verb's object case from the lexicon — a separable
// verb without one ("mitgehen", "zugehen") does not make "mit dir", "zu dir" wrong. An unknown verb has no lemma.
function prefixUsedAsPreposition(analysis, clause, lexicon) {
  const verb = clause.lexicalVerb;
  if (!verb?.lemma) return null;
  const phrase = analysis.phrases.filter(inClause(clause)).find((p) => p.pronoun && p.governor
    && lexicon.findForms((e) => e.baseVerb === verb.lemma && e.objCase && e.lemma === `${p.governor.preposition}${verb.lemma}`).length);
  if (!phrase) return null;
  const particle = analysis.tokens[phrase.end + 1];
  const followsParticle = particle?.pos === 'VERB_PREFIX' || particle?.pos === 'ADV';
  const prep = clean(phrase.governor.token.raw);
  const original = [prep, clean(phrase.pronoun.raw), followsParticle ? clean(particle.raw) : null].filter(Boolean).join(' ');
  const correction = [clean(phrase.pronoun.raw), followsParticle ? clean(particle.raw) : prep].join(' ');
  return {
    category: 'rektion',
    code: 'ERR_TRANSITIVE_VERB_PREPOSITION',
    original,
    correction,
    explanation: `„${prep}${verb.lemma}“ ist transitiv: Die Person steht im Akkusativ ohne Präposition: „${correction}“ (nicht „${original}“).`,
  };
}

export const verbFrameRule = {
  id: 'verbFrame',
  check(analysis, context) {
    return analysis.clauses.flatMap((clause) => [
      missingReflexive(analysis, clause, context.lexicon),
      wrongPrepositionalObject(analysis, clause, context.lexicon),
      prefixUsedAsPreposition(analysis, clause, context.lexicon),
    ]).filter(Boolean);
  },
};

