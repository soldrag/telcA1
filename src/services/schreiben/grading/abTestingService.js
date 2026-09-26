/**
 * A/B Testing & Evaluation Comparison Service.
 * Compares grading results between different evaluation engines (e.g., Qwen LLM vs Micro-Ranker).
 * Computes telemetry (delta scores, latencies, criterion agreement) and persists history.
 */

export const STORAGE_AB_HISTORY_KEY = 'telc_ab_grading_history';
export const MAX_AB_HISTORY_RECORDS = 50;

const CRITERIA_NAMES = {
  anrede: 'Anrede',
  lp1: 'Punkt 1',
  lp2: 'Punkt 2',
  lp3: 'Punkt 3',
  gruss: 'Grußformel',
};

function extractCriterionScore(result, key) {
  const cb = result?.criteria_breakdown || result?.breakdown;
  if (!cb) return 0;
  if (key === 'lp1') return Number(cb.lp1 ?? cb.items?.[0]?.score) || 0;
  if (key === 'lp2') return Number(cb.lp2 ?? cb.items?.[1]?.score) || 0;
  if (key === 'lp3') return Number(cb.lp3 ?? cb.items?.[2]?.score) || 0;
  return Number(cb[key]) || 0;
}

export function buildCriteriaComparison(resultA, resultB) {
  return ['anrede', 'lp1', 'lp2', 'lp3', 'gruss'].map((key) => {
    const scoreA = extractCriterionScore(resultA, key);
    const scoreB = extractCriterionScore(resultB, key);
    return {
      id: key,
      label: CRITERIA_NAMES[key] || key,
      scoreA,
      scoreB,
      isMatch: scoreA === scoreB,
      delta: scoreB - scoreA,
    };
  });
}

export function compareGradingResults(resultA, resultB, metadata = {}) {
  const pointsA = Number(resultA?.points_earned ?? 0);
  const pointsB = Number(resultB?.points_earned ?? 0);
  const criteriaComp = buildCriteriaComparison(resultA, resultB);
  const matchCount = criteriaComp.filter((c) => c.isMatch).length;
  const agreementRate = Math.round((matchCount / criteriaComp.length) * 100);

  const durA = metadata.durationMsA || 0;
  const durB = metadata.durationMsB || 0;
  const speedup = durB > 0 ? Number((durA / durB).toFixed(1)) : 1;

  const comparison = {
    id: `ab_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    pointsA,
    pointsB,
    scoreDelta: Number((pointsB - pointsA).toFixed(1)),
    durationMsA: durA,
    durationMsB: durB,
    speedupFactor: speedup,
    agreementRate,
    criteriaComparison: criteriaComp,
    providerA: metadata.providerAId || resultA?.provider_id || 'standard',
    providerB: metadata.providerBId || resultB?.provider_id || 'micro_ranker',
  };

  saveAbRunRecord(comparison);
  return comparison;
}

export function saveAbRunRecord(record) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const history = getAbRunHistory();
    history.unshift(record);
    if (history.length > MAX_AB_HISTORY_RECORDS) {
      history.length = MAX_AB_HISTORY_RECORDS;
    }
    window.localStorage.setItem(STORAGE_AB_HISTORY_KEY, JSON.stringify(history));
  } catch (err) {
    console.warn('[ABTestingService] Failed to save record:', err);
  }
}

export function getAbRunHistory() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = window.localStorage.getItem(STORAGE_AB_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearAbRunHistory() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_AB_HISTORY_KEY);
    }
  } catch {}
}
