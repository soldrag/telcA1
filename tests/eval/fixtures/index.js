/**
 * Unified entry point for Schreiben Teil 2 evaluation fixtures.
 */

import { structuralCases } from './structuralCases.js';
import { leitpunkteCases } from './leitpunkteCases.js';
import { grammarAndExtremeCases } from './grammarAndExtremeCases.js';

export const evaluationQuestions = {
  'schreiben-modellsatz-1': {
    max_points: 10,
    options_json: {
      min_words: 30,
      rubric: {
        leitpunkte_criteria: [
          {
            id: 'lp1',
            label: 'Grund für Ihr Schreiben (Deutschkurs A1 im August)',
            keywords: ['deutschkurs', 'kurs', 'a1', 'sprachschule', 'august', 'besuchen', 'machen'],
            requiredMatches: 2
          },
          {
            id: 'lp2',
            label: 'Wann und wie lange (Termin, 4 Wochen, vormittags)',
            keywords: ['wochen', 'woche', 'zeit', 'vormittags', 'vormittag', 'termin', 'lernen'],
            requiredMatches: 2
          },
          {
            id: 'lp3',
            label: 'Frage nach den Kurskosten und Anmeldung',
            keywords: ['kosten', 'kostet', 'gebühr', 'gebühren', 'preis', 'anmelden', 'anmeldung', 'wie viel'],
            requiredMatches: 2
          }
        ]
      }
    }
  },
  'schreiben-modellsatz-2': {
    max_points: 10,
    options_json: {
      min_words: 30,
      rubric: {
        leitpunkte_criteria: [
          {
            id: 'lp1',
            label: 'Grund für Ihr Schreiben (Termin am Montag absagen)',
            keywords: ['termin', 'absagen', 'montag', 'nicht kommen', 'kann nicht', '14'],
            requiredMatches: 2
          },
          {
            id: 'lp2',
            label: 'Warum (Überstunden oder Arbeit)',
            keywords: ['arbeiten', 'arbeit', 'überstunden', 'ueberstunden', 'krank', 'länger'],
            requiredMatches: 1
          },
          {
            id: 'lp3',
            label: 'Neuer Terminvorschlag (Dienstag oder Mittwoch)',
            keywords: ['dienstag', 'mittwoch', 'nächste woche', 'neuen termin', 'neuer termin', 'zeit', 'termin'],
            requiredMatches: 2
          }
        ]
      }
    }
  }
};

export const allSchreibenEvaluationCases = [
  ...structuralCases,
  ...leitpunkteCases,
  ...grammarAndExtremeCases
];

export function getQuestionForCase(testCase) {
  return evaluationQuestions[testCase.examId] || evaluationQuestions['schreiben-modellsatz-1'];
}
