export const RANKER_DETAILS_TEXTS = {
  ru: {
    title: 'Детали проверки пунктов',
    engineTags: { 'evidence-head': 'EmbeddingGemma 300M (q4)', 'reference-alignment': 'Без модели: сверка с фразами' },
    explanation: 'Каждый пункт (и каждая его часть) читается по лучшему фрагменту письма в сравнении с эталонными фразами задания:',
    matchedLabel: 'Фрагмент:',
    noMatch: 'Подходящий фрагмент в тексте не найден',
    unitsTitle: 'Части пункта (полный балл — только если раскрыты все):',
    unassignedTitle: 'Предложения, не сопоставленные ни с одним пунктом:',
  },
  de: {
    title: 'Details der Leitpunkt-Prüfung',
    engineTags: { 'evidence-head': 'EmbeddingGemma 300M (q4)', 'reference-alignment': 'Ohne Modell: Abgleich mit Referenzsätzen' },
    explanation: 'Jeder Leitpunkt (und jeder Teil davon) wird am besten Textstück gegen die Referenzsätze der Aufgabe gelesen:',
    matchedLabel: 'Textstück:',
    noMatch: 'Kein passendes Textstück gefunden',
    unitsTitle: 'Teile des Leitpunkts (volle Punktzahl nur, wenn alle erfüllt sind):',
    unassignedTitle: 'Sätze ohne Zuordnung zu einem Leitpunkt:',
  },
  en: {
    title: 'Task point check details',
    engineTags: { 'evidence-head': 'EmbeddingGemma 300M (q4)', 'reference-alignment': 'Without the model: phrase alignment' },
    explanation: 'Each task point (and each part of it) is read from the best span of the letter against the task\'s reference phrases:',
    matchedLabel: 'Span:',
    noMatch: 'No matching span found in the text',
    unitsTitle: 'Parts of the point (full points only when all are addressed):',
    unassignedTitle: 'Sentences not matched to any task point:',
  },
};
