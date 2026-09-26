export const RANKER_DETAILS_TEXTS = {
  ru: {
    title: 'Детали проверки микро-ранжировщика (System 1)',
    modelTag: 'EmbeddingGemma 300M (q4)',
    explanation: 'Семантическое сопоставление пунктов плана с предложениями письма:',
    matchedLabel: 'Найденное предложение:',
    noMatch: 'Подходящее предложение в тексте не найдено',
    subAspectsTitle: 'Аспекты пункта (полный балл — только если раскрыты все):',
    arbitratedTag: '⚡ Решение Micro-Ranker',
    protectedTag: '🛡 Ранкер: {verdict}; оставлено {points} по ключевым словам',
    unassignedTitle: 'Предложения, не сопоставленные ни с одним пунктом:',
    fullCoverage: 'Полное соответствие',
    partialCoverage: 'Частичное соответствие',
    noCoverage: 'Не раскрыто',
  },
  de: {
    title: 'Details der Micro-Ranker-Analyse (System 1)',
    modelTag: 'EmbeddingGemma 300M (q4)',
    explanation: 'Semantischer Abgleich der Leitpunkte mit den Briefsätzen:',
    matchedLabel: 'Zugeordneter Satz:',
    noMatch: 'Kein passender Satz im Text gefunden',
    subAspectsTitle: 'Teilaspekte (volle Punktzahl nur, wenn alle erfüllt sind):',
    arbitratedTag: '⚡ Micro-Ranker-Entscheidung',
    protectedTag: '🛡 Ranker: {verdict}; {points} nach Schlüsselwörtern beibehalten',
    unassignedTitle: 'Sätze ohne Zuordnung zu einem Leitpunkt:',
    fullCoverage: 'Vollständig erfüllt',
    partialCoverage: 'Teilweise erfüllt',
    noCoverage: 'Nicht erfüllt',
  },
  en: {
    title: 'Micro-Ranker Analysis Details (System 1)',
    modelTag: 'EmbeddingGemma 300M (q4)',
    explanation: 'Semantic alignment of task points with letter sentences:',
    matchedLabel: 'Matched sentence:',
    noMatch: 'No matching sentence found in the text',
    subAspectsTitle: 'Sub-aspects (full points only when all are addressed):',
    arbitratedTag: '⚡ Micro-Ranker Decision',
    protectedTag: '🛡 Ranker: {verdict}; {points} kept from keyword evidence',
    unassignedTitle: 'Sentences not matched to any task point:',
    fullCoverage: 'Fully addressed',
    partialCoverage: 'Partially addressed',
    noCoverage: 'Not addressed',
  },
};

const COVERAGE_BY_LEVEL = { 2: 'full', 1: 'partial', 0: 'no' };

export function formatCoverageLabel(coverage, texts) {
  if (coverage === 'full') return texts.fullCoverage;
  if (coverage === 'partial') return texts.partialCoverage;
  return texts.noCoverage;
}

export function formatLevelVerdict(level, texts) {
  return formatCoverageLabel(COVERAGE_BY_LEVEL[level] || 'no', texts);
}
