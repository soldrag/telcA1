/**
 * Evaluates student essay against exam Leitpunkte using stem matching.
 * Awards 0, 1, or 2 points per Leitpunkt.
 */
import { stemGermanWord } from './linguistic/germanStemmer.js';

function extractStems(str = '') {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(w => stemGermanWord(w))
    .filter(s => s && s.length >= 3);
}

function evaluateSingleCriterion(textStems, criterion) {
  const rawKeywords = criterion.keywords || [];
  const critStems = rawKeywords.map(k => stemGermanWord(k));

  let matchedCount = 0;
  for (const cStem of critStems) {
    if (textStems.includes(cStem)) {
      matchedCount += 1;
    }
  }

  // If criterion has requiredMatches explicitly specified (e.g. 1 or 2)
  const req = criterion.requiredMatches !== undefined ? criterion.requiredMatches : 2;
  const threshold = Math.min(req, Math.max(1, critStems.length));

  if (matchedCount >= threshold) {
    return { score: 2, matched: true, detail: 'Inhaltspunkt ausreichend bearbeitet' };
  }

  if (matchedCount > 0) {
    return { score: 1, matched: true, detail: 'Inhaltspunkt nur teilweise erwähnt' };
  }

  return { score: 0, matched: false, detail: 'Inhaltspunkt nicht gefunden' };
}

export function analyzeLeitpunkte(text = '', criteria = []) {
  const textStems = extractStems(text);
  let totalScore = 0;

  const results = criteria.map((criterion, index) => {
    const evalResult = evaluateSingleCriterion(textStems, criterion);
    totalScore += evalResult.score;

    return {
      index: index + 1,
      id: criterion.id || `lp${index + 1}`,
      label: criterion.label || `Leitpunkt ${index + 1}`,
      score: evalResult.score,
      maxScore: 2,
      matched: evalResult.matched,
      detail: evalResult.detail
    };
  });

  return {
    score: totalScore,
    maxScore: criteria.length * 2,
    items: results
  };
}
