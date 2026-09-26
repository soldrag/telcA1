import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectTemporalExpression } from '../src/services/schreiben/grading/temporalRangeDetector.js';
import { hasPersonCount } from '../src/services/schreiben/grading/personCountDetector.js';
import { defaultA1RankerPolicy as policy } from '../src/services/schreiben/grading/policies/a1RankerPolicy.js';
import { mergeArbitrationVerdict } from '../src/services/schreiben/grading/leitpunktArbitration.js';

describe('temporal expression detector', () => {
  it('recognises date ranges in A1 notations', () => {
    for (const text of ['von 15. Juli bis 25. Juli', 'vom 28. bis zum 4. August', 'vom 15.07. bis 25.07.', '15.07.-25.07.', 'vom fünfzehnten bis zum zwanzigsten Juli']) {
      assert.equal(detectTemporalExpression(text), 'range', text);
    }
  });

  it('does not read routes or quantities as periods', () => {
    assert.equal(detectTemporalExpression('Wir fahren von Hamburg bis Kiel.'), null);
    assert.equal(detectTemporalExpression('Wir sind 4 bis 5 Personen.'), null);
  });

  it('recognises durations and calendar points', () => {
    assert.equal(detectTemporalExpression('Wir bleiben zwei Wochen.'), 'duration');
    assert.equal(detectTemporalExpression('Wir kommen im Juli.'), 'point');
  });

  it('reads clock times and relative day adverbs as points, not the noun "Morgen" or a price', () => {
    for (const text of ['Können Sie bitte morgen kommen?', 'Morgen habe ich Zeit.', 'Ich bin ab 18 Uhr zu Hause.', 'Um zehn Uhr passt es.']) {
      assert.equal(detectTemporalExpression(text), 'point', text);
    }
    for (const text of ['Guten Morgen, Frau Müller.', 'Ich wünsche Ihnen einen schönen Morgen.', 'Meine Uhr ist kaputt.', 'Das kostet um die 50 Euro.']) {
      assert.equal(detectTemporalExpression(text), null, text);
    }
  });
});

describe('person count detector', () => {
  it('needs a number next to a person noun', () => {
    assert.equal(hasPersonCount('Wir sind vier Personen mit zwei Kinder.'), true);
    assert.equal(hasPersonCount('Ich komme allein.'), true);
    assert.equal(hasPersonCount('Wir kommen vom 15. bis 25. Juli.'), false);
  });
});

describe('A1 ranker policy evidence', () => {
  it('keeps the strongest signal when the embedder gave no verdict', () => {
    assert.equal(policy.combineEvidence({ neural: 0, lexical: 0.9, structured: 0, hasNeural: false }), 0.9);
  });

  it('caps a keyword-only hit that the neural verdict rejects (veto)', () => {
    const evidence = { neural: 0.2, lexical: 0.9, structured: 0, hasNeural: true };
    assert.ok(policy.combineEvidence(evidence) < policy.thresholds.full);
    assert.equal(policy.isLexicalVeto(evidence), true);
  });

  it('lets structured evidence stand against a neural rejection', () => {
    const evidence = { neural: 0.2, lexical: 0.9, structured: 0.95, hasNeural: true };
    assert.equal(policy.combineEvidence(evidence), 0.95);
    assert.equal(policy.isLexicalVeto(evidence), false);
  });

  it('does not trust the verdict on typo-heavy text', () => {
    assert.equal(policy.isVerdictReliable(['filen dank fur di einladunk, ich kome gern.']), false);
    assert.equal(policy.isVerdictReliable(['Wie viel kostet der Kurs und wie kann ich mich anmelden?']), true);
  });
});

describe('arbitration with the ranker as arbiter', () => {
  it("lets the arbiter's 'no' overrule a keyword baseline", () => {
    assert.equal(mergeArbitrationVerdict(1, { coverage: 'no' }, { rankerIsArbiter: true }).score, 0);
    assert.equal(mergeArbitrationVerdict(1, { coverage: 'no' }).score, 1);
  });

  it('caps a compound point with a vetoed aspect at partial', () => {
    const verdict = { coverage: 'full', isCompound: true, missingAspects: [], aspects: [{ coverage: 'partial', rankerVeto: true }, { coverage: 'full' }] };
    assert.equal(mergeArbitrationVerdict(2, verdict, { rankerIsArbiter: true }).score, 1);
    assert.equal(mergeArbitrationVerdict(2, verdict).score, 2);
  });
});

describe('Concept domains match a whole word or a compound head, never a substring', async () => {
  const { resolveConceptDomain } = await import('../src/services/schreiben/grading/conceptDomainScorer.js');
  const domainOf = (word) => resolveConceptDomain(word, policy.conceptDomains)?.[0] ?? null;

  it('credits compounds by their head', () => {
    assert.equal(domainOf('kurskosten'), domainOf('kosten'));
    assert.equal(domainOf('haustiere'), domainOf('tier'));
    assert.equal(domainOf('reparaturtermin'), domainOf('termin'));
    assert.equal(domainOf('anmeldung'), domainOf('anmelden'));
  });

  it('ignores substrings and numerals inside unrelated words', () => {
    for (const word of ['hausaufgaben', 'email', 'steuer', 'klavier', 'reservieren', 'sofort', 'antwort', 'vortrag']) {
      assert.equal(domainOf(word), null, word);
    }
  });
});

describe('Level policy bounds lexical hints on an unproven counted aspect', async () => {
  const { computeDeterministicFallbackScore } = await import('../src/services/schreiben/grading/rankerFallbackScorer.js');
  const personen = { label: 'Personen', evidence: 'personCount', keywords: ['personen', 'familie', 'kinder'] };

  it('persons without a number stay partial, a person count is full', () => {
    const vague = computeDeterministicFallbackScore(personen, 'Wir kommen mit der Familie.', { policy });
    const counted = computeDeterministicFallbackScore(personen, 'Wir sind zwei Erwachsene und zwei Kinder.', { policy });
    assert.equal(policy.classifyScore(vague), 'partial');
    assert.equal(policy.classifyScore(counted), 'full');
  });
});
