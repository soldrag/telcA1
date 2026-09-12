import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isWorkerSupported, gradeSchreibenWithWorker } from '../src/services/schreiben/grading/gradingWorkerClient.js';

describe('Grading Worker Client & Lifecycle Tests', () => {
  const sampleQuestion = {
    max_points: 10,
    options_json: {
      rubric: {
        leitpunkte_criteria: [
          { id: 'lp1', label: 'Deutschkurs im August', keywords: ['kurs', 'deutsch', 'august'], requiredMatches: 2 },
          { id: 'lp2', label: 'Zeit und Dauer', keywords: ['wochen', 'zeit', 'vormittag'], requiredMatches: 2 },
          { id: 'lp3', label: 'Kosten und Anmeldung', keywords: ['kosten', 'anmelden'], requiredMatches: 2 }
        ]
      }
    }
  };

  it('isWorkerSupported() correctly detects environment without window.Worker in Node.js', () => {
    assert.equal(isWorkerSupported(), false);
  });

  it('gradeSchreibenWithWorker() falls back to direct execution in non-worker environments', async () => {
    const text = `Sehr geehrte Damen und Herren,
ich möchte im August einen Deutschkurs machen. Ich habe vier Wochen Zeit. Was kostet der Kurs?
Mit freundlichen Grüßen
Anna Schmidt`;

    const progressUpdates = [];
    const result = await gradeSchreibenWithWorker({
      userText: text,
      question: sampleQuestion,
      options: { forceLimitedMode: true },
      onProgress: (msg) => progressUpdates.push(msg)
    });

    assert.equal(typeof result, 'object');
    assert.equal(result.points_earned >= 8, true);
    assert.equal(result.is_limited_mode, true);
    assert.equal(progressUpdates.length > 0, true);
  });
});
