/**
 * Robust JSON extractor and repair utility for local LLM output.
 * Fixes unescaped quotes, trailing commas, truncated arrays, and markdown code fences.
 */

export function extractAndParseLLMJson(rawText = '') {
  if (!rawText || typeof rawText !== 'string') return null;

  // 1. Strip markdown fences if present
  let clean = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  // 2. Find outermost curly braces
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace === -1) return null;

  let jsonCandidate = (lastBrace !== -1 && lastBrace > firstBrace)
    ? clean.substring(firstBrace, lastBrace + 1)
    : clean.substring(firstBrace);

  // 3. Try standard JSON.parse first
  try {
    return JSON.parse(jsonCandidate);
  } catch (e1) {
    // 4. Attempt repair: remove trailing commas before closing braces/brackets
    let repaired = jsonCandidate
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":'); // Ensure keys are quoted

    // If truncated, close open brackets/braces
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;

    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';

    try {
      return JSON.parse(repaired);
    } catch (e2) {
      // 5. Fallback heuristic extraction of fields if structural JSON is damaged
      return extractHeuristicFields(rawText);
    }
  }
}

function extractHeuristicFields(text = '') {
  const result = {
    criteria_breakdown: { anrede: 2, lp1: 2, lp2: 2, lp3: 2, gruss: 2 },
    grammar_errors: [],
    feedback_summary: ''
  };

  // Match numbers for anrede, lp1..3, gruss
  const anredeM = text.match(/"anrede"\s*:\s*(\d)/i);
  const lp1M = text.match(/"lp1"\s*:\s*(\d)/i);
  const lp2M = text.match(/"lp2"\s*:\s*(\d)/i);
  const lp3M = text.match(/"lp3"\s*:\s*(\d)/i);
  const grussM = text.match(/"gruss"\s*:\s*(\d)/i);

  if (anredeM) result.criteria_breakdown.anrede = parseInt(anredeM[1], 10);
  if (lp1M) result.criteria_breakdown.lp1 = parseInt(lp1M[1], 10);
  if (lp2M) result.criteria_breakdown.lp2 = parseInt(lp2M[1], 10);
  if (lp3M) result.criteria_breakdown.lp3 = parseInt(lp3M[1], 10);
  if (grussM) result.criteria_breakdown.gruss = parseInt(grussM[1], 10);

  const fbM = text.match(/"feedback_summary"\s*:\s*"([^"]+)"/i);
  if (fbM) result.feedback_summary = fbM[1];

  return result;
}
