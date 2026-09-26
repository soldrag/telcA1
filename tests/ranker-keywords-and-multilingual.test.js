import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyCriterionCoverage } from '../src/services/schreiben/grading/microRankerService.js';
import {
  formatCriterionQuery,
  partitionAspectKeywords,
} from '../src/services/schreiben/grading/rankerFallbackScorer.js';
import {
  shouldArbitrateLeitpunkt,
  mergeArbitrationVerdict,
} from '../src/services/schreiben/grading/leitpunktArbitration.js';
import { scorePipelineLeitpunkte } from '../src/services/schreiben/grading/pipelineStageScorers.js';
import { MicroRankerProvider } from '../src/services/ai/providers/MicroRankerProvider.js';
import { AIProvider } from '../src/services/ai/AIProvider.js';
import { PROVIDER_IDS } from '../src/services/ai/types.js';
import { TASK_PREFIX_TEXT, clearEmbeddingCache } from '../src/services/embeddings/embeddingService.js';
import { createConceptEmbedder, createFixedSimilarityEmbedder } from './helpers/mockRankerEmbedder.js';

const MATERIALIEN = { id: 'lp3', label: 'Materialien für den Sprachkurs', keywords: ['wörterbuch', 'papier', 'kuli'] };
const OSTSEE_LP2 = {
  id: 'lp2',
  label: 'Personen und Zeitraum',
  keywords: ['erwachsene', 'kind', 'kinder', 'woche', 'wochen', 'juli', 'august', 'personen', 'tage', 'zeitraum'],
};

class SpyProvider extends AIProvider {
  constructor(id) {
    super(id, `Spy ${id}`);
    this.calls = 0;
  }
  async classifyCoverage() {
    this.calls++;
    return { coverage: 'full' };
  }
}

class SpyMicroRanker extends MicroRankerProvider {
  constructor() {
    super({ embedder: null });
    this.calls = 0;
  }
  async classifyCoverage(...args) {
    this.calls++;
    return super.classifyCoverage(...args);
  }
}

describe('Micro-Ranker: rubric keywords & EmbeddingGemma port', () => {
  it('uses rubric keywords to grade paraphrased Materialien (full / partial / no)', async () => {
    const full = await classifyCriterionCoverage(MATERIALIEN, ['Ich bringe mein Wörterbuch, Papier und zwei Kulis mit.']);
    const partial = await classifyCriterionCoverage(MATERIALIEN, ['Ich habe nur mein Wörterbuch dabei.']);
    const no = await classifyCriterionCoverage(MATERIALIEN, ['Das Wetter in Berlin ist sehr schön und ich esse Pizza.']);
    assert.equal(full.coverage, 'full');
    assert.equal(partial.coverage, 'partial');
    assert.equal(no.coverage, 'no');
  });

  it('detects the Ostsee trap letter without dates as partial', async () => {
    const res = await classifyCriterionCoverage(OSTSEE_LP2, ['Wir sind vier Personen und kommen gern zu Ihnen.']);
    assert.equal(res.isCompound, true);
    assert.equal(res.coverage, 'partial');
    assert.deepEqual(res.missingAspects, ['Zeitraum']);
  });

  it('formats criterion queries with keywords for the embedding model', () => {
    assert.equal(formatCriterionQuery('Materialien', ['wörterbuch', 'kuli']), 'Materialien: wörterbuch, kuli');
    assert.equal(formatCriterionQuery('Grund', []), 'Grund');
  });

  it('partitions keywords per aspect: explicit rubric aspects win over inference', async () => {
    const explicit = await partitionAspectKeywords(
      { keywords: ['x'], aspects: [{ label: 'Dauer', keywords: ['tage'] }, { label: 'Kosten', keywords: ['euro'] }] },
      ['Dauer', 'Kosten']
    );
    assert.deepEqual(explicit, { Dauer: ['tage'], Kosten: ['euro'] });

    const inferred = await partitionAspectKeywords({ keywords: ['kostet', 'kinder'] }, ['Personen', 'Kosten']);
    assert.deepEqual(inferred.Kosten, ['kostet']);
    assert.deepEqual(inferred.Personen, ['kinder']);
  });

  it('scores via the embedder port when available (neural path)', async () => {
    const embedder = createConceptEmbedder({ material: ['wörterbuch', 'heft', 'stift', 'material'] });
    const res = await classifyCriterionCoverage({ label: 'Material' }, ['Ich bringe ein Heft und einen Stift.'], { embedder });
    assert.equal(res.coverage, 'full');
    assert.ok(embedder.calls.embedText > 0);
  });
});

describe('Micro-Ranker: competitive gate across task Leitpunkte', () => {
  const embedder = createConceptEmbedder({ familie: ['erwachsen', 'kind', 'person'], tier: ['hund', 'katze', 'tier'] });
  const tiere = { label: 'Tiere' };
  const leute = { label: 'Leute Kinder Personen' };

  it('ignores neural evidence for a sentence that is closer to a rival Leitpunkt', async () => {
    const sentence = ['Wir sind zwei Erwachsene und zwei Kinder.'];
    const ungated = await classifyCriterionCoverage(tiere, sentence, { embedder: createFixedSimilarityEmbedder(0.6) });
    const gated = await classifyCriterionCoverage(tiere, sentence, { embedder, rivalCriteria: [leute] });
    assert.equal(ungated.coverage, 'partial');
    assert.equal(gated.coverage, 'no');
  });

  it('keeps neural evidence when the sentence belongs to the scored Leitpunkt', async () => {
    const res = await classifyCriterionCoverage(tiere, ['Dürfen wir unseren Hund mitbringen?'], { embedder, rivalCriteria: [leute] });
    assert.equal(res.coverage, 'full');
  });
});

describe('Leitpunkt arbitration: primary ranker & compound cap', () => {
  it('micro_ranker evaluates every criterion; LLM providers only in gray zones', () => {
    const ranker = { id: PROVIDER_IDS.MICRO_RANKER };
    const llm = { id: PROVIDER_IDS.CLIENT_WEBGPU };
    assert.equal(shouldArbitrateLeitpunkt({ provider: ranker, effectiveSim: 0.95, framePenalty: 0 }), true);
    assert.equal(shouldArbitrateLeitpunkt({ provider: llm, effectiveSim: 0.95, framePenalty: 0 }), false);
    assert.equal(shouldArbitrateLeitpunkt({ provider: llm, effectiveSim: 0.66, framePenalty: 0 }), true);
    assert.equal(shouldArbitrateLeitpunkt({ provider: ranker, effectiveSim: 0.95, framePenalty: 2 }), false);
  });

  it('caps a compound verdict with a missing aspect at 1 point despite baseline 2', () => {
    const verdict = { coverage: 'partial', isCompound: true, missingAspects: ['Dauer'] };
    assert.equal(mergeArbitrationVerdict(2, verdict).score, 1);
    assert.equal(mergeArbitrationVerdict(2, { coverage: 'partial' }).score, 2);
  });

  it('Fahrradverleih trap letter scores 1 point in the pipeline even with keyword baseline 2', async () => {
    const crit = { id: 'lp2', label: 'Dauer und Kosten', keywords: ['fahrrad', 'mieten', 'kostet'] };
    const body = ['Ich möchte ein Fahrrad mieten.', 'Wie viel kostet das pro Tag?'];
    const res = await scorePipelineLeitpunkte({
      criteria: [crit], bodySentences: body, provider: new MicroRankerProvider({ embedder: null }), customExtractor: false,
    });
    assert.equal(res.items[0].baselineScore, 2);
    assert.equal(res.items[0].score, 1);
    assert.deepEqual(res.items[0].rankerDetails.missingAspects, ['Dauer']);
  });

  it('runs micro_ranker on all 3 criteria, a generative provider only on gray-zone ones', async () => {
    const criteria = [
      { id: 'lp1', label: 'Grund', keywords: ['urlaub'], requiredMatches: 1 },
      { id: 'lp2', label: 'Personen', keywords: ['vier'], requiredMatches: 1 },
      { id: 'lp3', label: 'Haustiere', keywords: ['hund'], requiredMatches: 1 },
    ];
    const body = ['Wir möchten Urlaub in Ihrer Ferienwohnung machen.', 'Wir sind vier Personen.', 'Dürfen wir einen Hund mitbringen?'];
    const ranker = new SpyMicroRanker();
    const llm = new SpyProvider(PROVIDER_IDS.CLIENT_WEBGPU);
    await scorePipelineLeitpunkte({ criteria, bodySentences: body, provider: ranker, customExtractor: false });
    await scorePipelineLeitpunkte({ criteria, bodySentences: body, provider: llm, customExtractor: false });
    assert.equal(ranker.calls, 3);
    assert.equal(llm.calls, 0);
  });

  it('reuses Stage 2 sentence vectors instead of re-embedding them in the ranker', async () => {
    clearEmbeddingCache();
    const concepts = createConceptEmbedder({ hund: ['hund'], urlaub: ['urlaub'] });
    const textCalls = [];
    const extractor = async (prompt) => {
      if (prompt.startsWith(TASK_PREFIX_TEXT)) textCalls.push(prompt);
      return { data: await concepts.embedText(prompt) };
    };
    const body = ['Wir machen Urlaub.', 'Dürfen wir einen Hund mitbringen?'];
    const criteria = [{ id: 'lp1', label: 'Haustiere', keywords: ['hund'] }, { id: 'lp2', label: 'Urlaub', keywords: ['urlaub'] }];
    await scorePipelineLeitpunkte({ criteria, bodySentences: body, provider: new MicroRankerProvider(), customExtractor: extractor });
    assert.equal(textCalls.length, body.length);
  });
});

describe('Deterministic fallback ignores function words', () => {
  it('does not credit "Sie"/"für" as concept or label overlap', async () => {
    const { computeDeterministicFallbackScore } = await import('../src/services/schreiben/grading/rankerFallbackScorer.js');
    assert.ok(computeDeterministicFallbackScore('Wie lange Sie fehlen', 'Bitte schicken Sie mir die Hausaufgaben.') < 0.4);
    assert.ok(computeDeterministicFallbackScore('Termin für die Besichtigung', 'Ich möchte mein Auto verkaufen für 5000 Euro.') < 0.4);
    assert.ok(computeDeterministicFallbackScore('Termin für die Besichtigung', 'Kann ich die Wohnung am Samstag besichtigen? Wann haben Sie einen Termin?') >= 0.65);
  });
});
