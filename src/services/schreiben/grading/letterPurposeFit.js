/**
 * Whether a letter serves the purpose of its task, read from the rubric example phrases.
 * A letter for another task reuses the task's words ("Ich brauche einen Termin am Montag um 14 Uhr" for a
 * cancellation, a party invitation for a flat viewing), so keywords cannot see it. Here every body sentence is
 * compared with the phrases that fulfil or miss each Leitpunkt: the letter's reason for writing (the first
 * Leitpunkt, as telc lists it) and the share of sentences that serve any Leitpunkt are facts; the level policy
 * decides when they mean another task, the regulation what that costs.
 */

import { cosineSimilarity } from './vectorMath.js';

function exampleUnits(criterion) {
  const examples = criterion?.examples;
  if (!examples) return [];
  return examples.aspects ? Object.values(examples.aspects) : [examples];
}

async function closest(sentVec, phrases, embedder) {
  let best = 0;
  for (const phrase of phrases) best = Math.max(best, cosineSimilarity(await embedder.embedExample(phrase), sentVec));
  return best;
}

// Similarity to the closest fulfilling phrase of the criterion, or 0 when the sentence resembles a near miss more.
async function supportFor(criterion, sentVec, embedder) {
  let best = 0;
  for (const unit of exampleUnits(criterion)) {
    const fulfils = await closest(sentVec, unit.fulfils || [], embedder);
    const misses = await closest(sentVec, unit.misses || [], embedder);
    if (fulfils > misses) best = Math.max(best, fulfils);
  }
  return best;
}

/**
 * @param {{ bodySentences: string[], criteria: object[], embedder: object|null, policy: object }} input
 * @returns {Promise<{ servesTaskPurpose: boolean|null }>} null when the model or the example phrases are missing
 */
export async function assessLetterPurpose({ bodySentences = [], criteria = [], embedder = null, policy }) {
  if (!embedder?.embedExample || bodySentences.length === 0 || !criteria.every((c) => exampleUnits(c).length > 0)) {
    return { servesTaskPurpose: null };
  }
  try {
    let purposeSimilarity = 0;
    let supported = 0;
    for (const sentence of bodySentences) {
      const sentVec = await embedder.embedText(sentence);
      const support = [];
      for (const criterion of criteria) support.push(await supportFor(criterion, sentVec, embedder));
      purposeSimilarity = Math.max(purposeSimilarity, support[0]);
      if (policy.isExampleSupport(Math.max(...support))) supported += 1;
    }
    const servesTaskPurpose = !policy.isOffTaskLetter({ purposeSimilarity, supportShare: supported / bodySentences.length });
    return { servesTaskPurpose };
  } catch (err) {
    console.warn('[LetterPurposeFit] Example embedding failed:', err?.message || err);
    return { servesTaskPurpose: null };
  }
}
