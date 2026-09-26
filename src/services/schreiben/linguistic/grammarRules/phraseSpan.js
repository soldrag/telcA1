/** Quoting helpers shared by rules: phrase text, optionally extended to the clause's lexical verb. */
const clean = (raw = '') => raw.replace(/[.,;:!?]+$/, '');

export function spanText(tokens, start, end) {
  return tokens.slice(start, end + 1).map((t) => clean(t.raw)).join(' ');
}

/** Extends the quote to the lexical verb when it follows the phrase, so the learner sees the verb it depends on. */
export function spanToVerb(tokens, phrase, clause) {
  const verbIndex = clause?.lexicalVerb ? tokens.indexOf(clause.lexicalVerb) : -1;
  const end = verbIndex > phrase.end ? verbIndex : phrase.end;
  return { from: phrase.start, to: end, text: spanText(tokens, phrase.start, end) };
}
