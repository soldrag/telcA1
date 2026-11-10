import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EvidenceHeadAssessor } from '../src/services/schreiben/grading/assessors/evidenceHeadAssessor.js';
import { indexTaskPhrases } from '../src/services/schreiben/grading/evidenceHead/taskReferences.js';
import { hashPhrases } from '../src/services/schreiben/grading/evidenceHead/referenceVectors.js';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';
import { aiProviderRegistry } from '../src/services/ai/aiProviderRegistry.js';
import { PROVIDER_IDS, GRADING_FALLBACK_REASONS } from '../src/services/ai/types.js';
import { gradeSchreibenSubmission } from '../src/services/schreiben/gradingPipeline.js';

const readJson = (p) => JSON.parse(fs.readFileSync(new URL(p, import.meta.url), 'utf8'));

describe('evidence head references', () => {
  it('stored reference vectors match the current rubrics and phrases (rebuild with buildReferences.mjs)', async () => {
    const examples = readJson('../src/data/exams/schreiben-leitpunkt-examples.json');
    for (const n of [1, 2, 3, 4, 5, 6, 7]) {
      const { questions } = await import(`../src/data/exams/seeds/schreiben-modellsatz-${n}.js`);
      const q = questions.find((x) => x.teil === 2);
      const task = { situation: q.situation, criteria: q.options_json.rubric.leitpunkte_criteria };
      const indexed = indexTaskPhrases({ task, bank: readJson(`../src/data/exams/example-bank/${q.id}.json`), examples: examples[q.id] });
      const stored = readJson(`../src/data/exams/evidence-head/${q.id}.json`);
      assert.equal(stored.phrases, hashPhrases(indexed.texts), q.id);
      assert.deepEqual(stored.groups.map((g) => g.units.map((u) => u.key)), indexed.groups.map((g) => g.units.map((u) => u.key)), q.id);
    }
  });
});

// A stand-in for the embedding model: a fixed pseudo-random direction per word, summed over the text.
function fakeExtractor(prompt) {
  const v = new Float32Array(32);
  for (const word of prompt.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean)) {
    let h = 2166136261;
    for (const ch of word) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
    for (let i = 0; i < v.length; i++) v[i] += ((h >>> (i % 24)) & 1) ? 1 : -1;
  }
  return Promise.resolve({ data: v });
}

const question = {
  id: 'evidence-head-test',
  situation: 'Sie möchten ein Zimmer im Hotel buchen.',
  options_json: {
    evidenceBank: {
      units: {
        lp1: { fulfils: ['Ich möchte ein Zimmer buchen.', 'Haben Sie ein Zimmer frei?'], misses: { refusal: ['Ich möchte kein Zimmer.'] } },
        lp2: { fulfils: ['Ich komme am Montag.', 'Ich bleibe drei Nächte.'], misses: { vague: ['Bald.'] } },
      },
      otherPurpose: ['Ich möchte mich über das Essen beschweren.'],
      purposeLetters: { onTask: ['Ich möchte ein Zimmer buchen und komme am Montag.'], offTask: ['Das Essen war kalt, ich beschwere mich.'] },
    },
  },
};
const criteria = [{ id: 'lp1', label: 'Grund' }, { id: 'lp2', label: 'Wann' }];

describe('EvidenceHeadAssessor', () => {
  it('reads every Leitpunkt from the head, with a span and its own purpose reading, when the model is there', async () => {
    const policy = resolveLevelContext('A1').policy;
    const result = await new EvidenceHeadAssessor().assess({
      question, criteria, policy, bodySentences: ['Ich möchte ein Zimmer buchen.', 'Ich komme am Montag.'],
      provider: aiProviderRegistry.getProvider(PROVIDER_IDS.MICRO_RANKER), evidenceExtractor: fakeExtractor,
    });
    assert.equal(result.modelUsed, true);
    assert.equal(typeof result.servesTaskPurpose, 'boolean');
    assert.deepEqual(result.items.map((it) => it.id), ['lp1', 'lp2']);
    for (const item of result.items) {
      assert.ok([0, 1, 2].includes(item.score));
      assert.equal(item.rankerDetails.engine, 'evidence-head');
    }
  });

  it('hands the letter to reference alignment, also keyword-free, in the limited mode', async () => {
    const policy = resolveLevelContext('A1').policy;
    const result = await new EvidenceHeadAssessor().assess({
      question, criteria: criteria.map((c) => ({ ...c, intent: 'GENERAL', keywords: ['zimmer'] })), policy,
      bodySentences: ['Ich möchte ein Zimmer buchen.'], provider: aiProviderRegistry.getProvider(PROVIDER_IDS.NONE),
    });
    assert.equal(result.servesTaskPurpose, null);
    assert.equal(result.modelUsed, false);
    assert.equal(result.items[0].rankerDetails.engine, 'reference-alignment');
    assert.equal(result.items[0].score, 2, 'the letter repeats a fulfilling phrase of LP1');
  });

  it('a task without reference phrases is an error of the assessor, and the pipeline still returns a grading that names it', async () => {
    const policy = resolveLevelContext('A1').policy;
    await policy.lexicon.load();
    const task = { id: 'task-without-phrases', level: 'A1', situation: question.situation, options_json: { rubric: { leitpunkte_criteria: criteria } } };
    await assert.rejects(new EvidenceHeadAssessor().assess({
      question: task, criteria, policy, bodySentences: ['Ich möchte ein Zimmer buchen.'],
      provider: aiProviderRegistry.getProvider(PROVIDER_IDS.NONE),
    }), /task-without-phrases/);

    const res = await gradeSchreibenSubmission({
      userText: 'Sehr geehrte Damen und Herren,\nich möchte ein Zimmer buchen.\nMit freundlichen Grüßen\nAnna', question: task,
      options: { forceLimitedMode: true },
    });
    assert.equal(res.grading_fallback.reason, GRADING_FALLBACK_REASONS.LEITPUNKTE_UNREADABLE);
    assert.match(res.grading_fallback.detail, /task-without-phrases/);
    assert.equal(res.provider_id, null, 'the results screen grades the letter again');
    assert.deepEqual(res.breakdown.items.map((it) => it.points), [0, 0]);
    assert.equal(res.breakdown.anrede, 2);
  });

  it('does not read the letter against references of another dimension', async () => {
    const policy = resolveLevelContext('A1').policy;
    const shortVectors = (prompt) => fakeExtractor(prompt).then(({ data }) => ({ data: data.slice(0, 8) }));
    const result = await new EvidenceHeadAssessor().assess({
      question: { ...question, id: 'evidence-head-test-dims' }, criteria, policy, bodySentences: ['Ich möchte ein Zimmer buchen.'],
      letterText: 'Ganzer Brief', provider: aiProviderRegistry.getProvider(PROVIDER_IDS.MICRO_RANKER),
      evidenceExtractor: (prompt) => (prompt.includes('Ganzer Brief') ? shortVectors(prompt) : fakeExtractor(prompt)),
    });
    assert.equal(result.modelUsed, false);
    assert.equal(result.servesTaskPurpose, null);
  });
});
