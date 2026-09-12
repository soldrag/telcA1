/**
 * Generic structural clause and predicate-argument chunker for German A1.
 * Pure structural analysis: zero domain keywords, strictly McConnell compliant (<= 80 lines).
 */

function extractNounPhrases(tokens = []) {
  const nps = [];
  let current = [];

  for (const t of tokens) {
    if (t.pos === 'DET' || t.pos === 'ADJ' || t.pos === 'NOUN' || t.pos === 'PRON_SUBJ' || t.pos === 'PRON_OBJ') {
      current.push(t);
      if (t.pos === 'NOUN' || t.pos === 'PRON_SUBJ' || t.pos === 'PRON_OBJ') {
        nps.push({ tokens: [...current], head: t });
        current = [];
      }
    } else {
      current = [];
    }
  }
  return nps;
}

function extractPredicates(tokens = []) {
  const preds = [];
  for (const t of tokens) {
    const isVerb = t.pos === 'VERB_FIN' || t.pos === 'VERB_INF' || t.pos === 'VERB_MOD';
    const isPredAdj = t.pos === 'ADJ' || t.pos === 'PART';
    if (isVerb || isPredAdj) {
      preds.push(t);
    }
  }
  return preds;
}

function splitTokensByConjunction(tokens = []) {
  const clauses = [];
  let current = [];

  for (const t of tokens) {
    const isBoundary = t.lower === 'und' || t.lower === 'oder' || t.lower === 'aber';
    if (isBoundary && current.length > 0) {
      clauses.push(current);
      current = [];
    } else if (!isBoundary) {
      current.push(t);
    }
  }
  if (current.length > 0) {
    clauses.push(current);
  }
  return clauses.length > 0 ? clauses : [tokens];
}

export function chunkSentenceStructure(taggedTokens = []) {
  if (!Array.isArray(taggedTokens) || taggedTokens.length === 0) {
    return [];
  }

  const clauseTokenLists = splitTokensByConjunction(taggedTokens);
  return clauseTokenLists.map(cTokens => ({
    predicates: extractPredicates(cTokens),
    arguments: extractNounPhrases(cTokens)
  }));
}
