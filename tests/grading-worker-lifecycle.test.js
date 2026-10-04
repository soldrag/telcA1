import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isWorkerSupported, gradeSchreibenWithWorker, gradeInWorker } from '../src/services/schreiben/grading/gradingWorkerClient.js';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';

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
    const direct = await gradeSchreibenSubmission({ userText: text, question: sampleQuestion, options: { forceLimitedMode: true } });
    assert.equal(result.points_earned, direct.points_earned);
    assert.deepEqual(result.criteria_breakdown, direct.criteria_breakdown);
    assert.equal(result.is_limited_mode, true);
    // A limited-mode grading downloads no model: its stages only, in order.
    assert.deepEqual(progressUpdates.map((event) => event.stage), ['preprocessing', 'leitpunkte', 'grammar', 'feedback', 'done']);
  });

  describe('gradeInWorker', () => {
    // Replies to GRADE_REQUEST with the scripted messages, each after its delay (ms).
    function installFakeWorker(script) {
      const spawned = [];
      class FakeWorker {
        constructor() { this.terminated = false; spawned.push(this); }
        postMessage({ id }) {
          let at = 0;
          for (const { delay = 0, ...message } of script) {
            at += delay;
            setTimeout(() => { if (!this.terminated) this.onmessage?.({ data: { id, ...message } }); }, at);
          }
        }
        terminate() { this.terminated = true; }
      }
      globalThis.Worker = FakeWorker;
      return spawned;
    }

    function removeFakeWorker() {
      delete globalThis.Worker;
    }

    it('terminates the worker after a result', async () => {
      const spawned = installFakeWorker([{ type: 'SUCCESS', result: { points_earned: 7 } }]);
      try {
        const result = await gradeInWorker({ userText: 'x', question: sampleQuestion });
        assert.equal(result.points_earned, 7);
        assert.equal(spawned[0].terminated, true);
      } finally {
        removeFakeWorker();
      }
    });

    it('terminates the worker after an error', async () => {
      const spawned = installFakeWorker([{ type: 'ERROR', error: 'boom' }]);
      try {
        await assert.rejects(gradeInWorker({ userText: 'x', question: sampleQuestion }), /boom/);
        assert.equal(spawned[0].terminated, true);
      } finally {
        removeFakeWorker();
      }
    });

    it('keeps waiting while the worker reports progress, longer than the idle timeout in total', async () => {
      const download = (mb) => ({ stage: 'model_download', fraction: 0.4, loadedBytes: mb * 1e6 });
      const progress = [1, 2, 3, 4].map((mb) => ({ type: 'PROGRESS', event: download(mb), delay: 30 }));
      installFakeWorker([...progress, { type: 'SUCCESS', result: { points_earned: 9 }, delay: 30 }]);
      try {
        const updates = [];
        const result = await gradeInWorker({
          userText: 'x', question: sampleQuestion, timeoutMs: 60, onProgress: (event) => updates.push(event),
        });
        assert.equal(result.points_earned, 9);
        assert.deepEqual(updates, [1, 2, 3, 4].map(download));
      } finally {
        removeFakeWorker();
      }
    });

    it('a failed worker is named in the limited result the letter is graded with instead', async () => {
      installFakeWorker([{ type: 'ERROR', error: 'GatherBlockQuantized missing' }]);
      globalThis.window = globalThis;
      try {
        const result = await gradeSchreibenWithWorker({ userText: 'Hallo', question: sampleQuestion });
        assert.equal(result.grading_mode, 'limited');
        assert.deepEqual(result.grading_fallback, { reason: 'worker_failed', detail: 'GatherBlockQuantized missing' });
      } finally {
        delete globalThis.window;
        removeFakeWorker();
      }
    });

    it('gives up and terminates the worker after the idle timeout without progress', async () => {
      const spawned = installFakeWorker([{ type: 'SUCCESS', result: {}, delay: 200 }]);
      try {
        await assert.rejects(gradeInWorker({ userText: 'x', question: sampleQuestion, timeoutMs: 40 }), /Zeitlimit/);
        assert.equal(spawned[0].terminated, true);
      } finally {
        removeFakeWorker();
      }
    });
  });
});
