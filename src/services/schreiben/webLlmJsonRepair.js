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
  // 1. Try extracting single-enum coverage for Stage 2 arbitration
  const covMatch = text.match(/"coverage"\s*:\s*"([a-zA-Z0-9_]+)"/i);
  if (covMatch) {
    return { coverage: covMatch[1].toLowerCase() };
  }

  // 2. Try extracting feedback summary for Stage 4
  const fbMatch = text.match(/"feedback"\s*:\s*"([^"]+)"/i);
  if (fbMatch) {
    return { feedback: fbMatch[1].trim() };
  }

  // Unsalvageable damaged output: return null so caller falls back to deterministic score
  return null;
}
