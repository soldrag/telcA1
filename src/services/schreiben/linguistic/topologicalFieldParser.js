/**
 * German A1 Topological Field Parser (Topologisches Feldermodell).
 * Validates V2 word order, subject-verb inversion, and Satzklammer brackets.
 * Strictly complies with McConnell limits (<= 180 lines, <= 25 lines per function).
 */

import { tagTokens } from './a1LexiconService.js';
import { estimateVorfeldConstituents } from './vorfeldChunker.js';
import { checkVerblessClause } from './verblessClauseChecker.js';

function splitIntoWords(clauseStr = '') {
  return clauseStr
    .trim()
    .replace(/[.,!?;:]+$/, '')
    .split(/\s+/)
    .filter(Boolean);
}

function checkV2AndInversion(constituents = [], finVerb = {}, mittelfeld = []) {
  const errors = [];
  if (constituents.length > 1) {
    const firstConst = constituents[0].rawText;
    const restBeforeVerb = constituents.slice(1).map(c => c.rawText).join(' ');
    errors.push({
      category: 'syntax',
      code: 'ERR_V2_OVERCROWDED_VORFELD',
      original: `${firstConst} ${restBeforeVerb} ${finVerb.raw}`,
      correction: `${firstConst} ${finVerb.raw} ${restBeforeVerb}`,
      explanation: `Verbzweitstellung verletzt: Nach der Angabe „${firstConst}“ steht das konjugierte Verb an Position 2: „${firstConst} ${finVerb.raw} ${restBeforeVerb}“`
    });
    return errors;
  }

  if (constituents.length === 1 && (constituents[0].type === 'PP' || constituents[0].type === 'ADVP')) {
    const hasSubj = mittelfeld.some(t => t.pos === 'PRON_SUBJ' || t.pos === 'NOUN');
    if (!hasSubj) {
      errors.push({
        category: 'syntax',
        code: 'ERR_MISSING_SUBJECT_INVERSION',
        original: `${constituents[0].rawText} ${finVerb.raw}`,
        correction: `${constituents[0].rawText} ${finVerb.raw} [Subjekt]`,
        explanation: `Inversion: Nach „${constituents[0].rawText} ${finVerb.raw}“ fehlt das Subjekt im Mittelfeld.`
      });
    }
  }
  return errors;
}

function isIllegalNachfeld(afterTokens = []) {
  if (afterTokens.length === 0) return false;
  const constituents = estimateVorfeldConstituents(afterTokens);
  return constituents.some(c => c.type !== 'PP');
}

function checkSatzklammer(finVerb = {}, mittelfeld = []) {
  const errors = [];
  if (mittelfeld.length === 0) return errors;

  if (finVerb.valency === 'MODAL') {
    const infIdx = mittelfeld.findIndex((t, i) => t.pos === 'VERB_INF' && i < mittelfeld.length - 1);
    if (infIdx !== -1 && isIllegalNachfeld(mittelfeld.slice(infIdx + 1))) {
      const infToken = mittelfeld[infIdx];
      const after = mittelfeld.slice(infIdx + 1).map(t => t.raw).join(' ');
      errors.push({
        category: 'syntax',
        code: 'ERR_BROKEN_SATZKLAMMER_MODAL',
        original: `${infToken.raw} ${after}`,
        correction: `${after} ${infToken.raw}`,
        explanation: `Satzklammer verletzt: Bei Modalverben („${finVerb.raw}“) steht der Infinitiv am Satzende: „... ${after} ${infToken.raw}“`
      });
    }
  } else if (finVerb.valency === 'SEP' && finVerb.baseVerb) {
    const pfxIdx = mittelfeld.findIndex((t, i) => t.pos === 'VERB_PREFIX' && i < mittelfeld.length - 1);
    if (pfxIdx !== -1 && isIllegalNachfeld(mittelfeld.slice(pfxIdx + 1))) {
      const pfx = mittelfeld[pfxIdx];
      const after = mittelfeld.slice(pfxIdx + 1).map(t => t.raw).join(' ');
      errors.push({
        category: 'syntax',
        code: 'ERR_BROKEN_SATZKLAMMER_PREFIX',
        original: `${pfx.raw} ${after}`,
        correction: `${after} ${pfx.raw}`,
        explanation: `Satzklammer verletzt: Die trennbare Vorsilbe „${pfx.raw}“ gehört ans Satzende: „... ${after} ${pfx.raw}“`
      });
    }
  }
  return errors;
}

function parseClause(tokens = [], isCoordinated = false, precedingSubject = null, rawText = '', inSubordinateScope = false) {
  if (tokens[0]?.pos === 'KONJ_SUB' || /^(weil|dass|wenn|ob)$/i.test(tokens[0]?.raw || '')) {
    return { type: 'SUBORDINATE_CLAUSE', tokens, errors: [] };
  }

  const finVerbIdx = tokens.findIndex(t => t.pos === 'VERB_FIN' || t.pos === 'VERB_MOD');
  if (finVerbIdx === -1) {
    if (isCoordinated) {
      return { type: 'COORDINATED_PHRASE', tokens, errors: [] };
    }
    const fragmentError = checkVerblessClause(tokens, rawText);
    return { type: 'FRAGMENT', tokens, errors: fragmentError ? [fragmentError] : [] };
  }

  // Coordinated subordinate clause (e.g. "..., weil A und B ist")
  if (isCoordinated && inSubordinateScope) {
    const isVerbFinal = finVerbIdx >= tokens.length - 2;
    if (isVerbFinal) {
      return { type: 'COORDINATED_SUBORDINATE_CLAUSE', tokens, errors: [] };
    }
  }

  const finVerb = tokens[finVerbIdx];
  const vorfeldTokens = tokens.slice(0, finVerbIdx);
  const mittelfeldTokens = tokens.slice(finVerbIdx + 1);

  // Coordinated subject-ellipsis check ("und kann nicht kommen")
  if (isCoordinated && vorfeldTokens.length === 0 && precedingSubject) {
    const agreesPerson = !finVerb.person || finVerb.person.includes(precedingSubject.person?.[0] ?? 0);
    if (agreesPerson) {
      const skErrors = checkSatzklammer(finVerb, mittelfeldTokens);
      return { type: 'V2_COORDINATED_ELLIPSIS', finVerb, vorfeld: [], mittelfeld: mittelfeldTokens, errors: skErrors };
    }
  }

  if (finVerbIdx === 0) {
    const skErrors = checkSatzklammer(finVerb, mittelfeldTokens);
    return { type: 'V1_QUESTION_OR_IMP', finVerb, vorfeld: [], mittelfeld: mittelfeldTokens, errors: skErrors };
  }

  const constituents = estimateVorfeldConstituents(vorfeldTokens);
  const v2Errors = checkV2AndInversion(constituents, finVerb, mittelfeldTokens);
  const skErrors = checkSatzklammer(finVerb, mittelfeldTokens);

  return {
    type: 'V2_STATEMENT',
    finVerb,
    constituents,
    vorfeld: vorfeldTokens,
    mittelfeld: mittelfeldTokens,
    errors: [...v2Errors, ...skErrors]
  };
}

export function parseSentenceTopology(sentenceStr = '') {
  const clean = sentenceStr.trim();
  if (!clean) return { clauses: [], errors: [] };

  // Split on commas and coordinate conjunctions
  const rawClauses = clean.split(/,\s*|\b(?=und\s+|aber\s+|oder\s+|denn\s+)/i);
  const parsedClauses = [];
  const allErrors = [];
  let lastSubject = null;
  let inSubordinateScope = false;

  for (let i = 0; i < rawClauses.length; i++) {
    const clauseText = rawClauses[i].trim();
    if (!clauseText) continue;

    const words = splitIntoWords(clauseText);
    const isCoordinated = i > 0 && /^(und|aber|oder|denn)\b/i.test(words[0]);
    const coordWord = isCoordinated ? words[0].toLowerCase() : '';
    const activeWords = isCoordinated ? words.slice(1) : words;

    if (coordWord === 'aber' || coordWord === 'denn') {
      inSubordinateScope = false;
    }

    const tagged = tagTokens(activeWords);
    const parsed = parseClause(tagged, isCoordinated, lastSubject, clauseText, inSubordinateScope);

    if (parsed.type === 'SUBORDINATE_CLAUSE') {
      inSubordinateScope = true;
    }

    if (parsed.vorfeld) {
      const subj = tagged.find(t => t.pos === 'PRON_SUBJ');
      if (subj) lastSubject = subj;
    }

    parsedClauses.push(parsed);
    if (parsed.errors && parsed.errors.length > 0) {
      allErrors.push(...parsed.errors);
    }
  }

  return { clauses: parsedClauses, errors: allErrors };
}
