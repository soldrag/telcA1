import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectTemporalExpression } from '../src/services/schreiben/grading/temporalRangeDetector.js';
import { hasPersonCount } from '../src/services/schreiben/grading/personCountDetector.js';
import { hasOccupation } from '../src/services/schreiben/grading/occupationDetector.js';
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

  it('reads a group adverb and relatives named after "mit" as who comes', () => {
    for (const text of ['Wir kommen zu dritt.', 'Wir sind zu zweit.', 'Ich komme mit meiner Frau und meinem Sohn.',
      'Wir fahren mit unseren Eltern.', 'Ich reise mit meinem Bruder.', 'Ich komme mit meinen Freunden.', 'Ich fliege mit meiner Familie.', 'Er kommt mit seiner Frau.',
      'Ich komme am 3. Juli mit meiner Frau.', 'Wir kommen vom 15. bis 25. Juli mit unseren Kindern.', 'Ich komme am 3.7. mit meiner Frau.',
      'Wir kommen mit unseren Toechtern.', 'Er faehrt mit seiner Mutter.', 'Ich komme mit eurer Familie.', 'Ich komme mit meinen Geschwistern.',
      'Wir sind fünf Personen.', 'Wir sind zwölf Personen.']) {
      assert.equal(hasPersonCount(text), true, text);
    }
  });

  it('does not read a relative or a preposition alone as a count', () => {
    for (const text of ['Meine Frau arbeitet als Ärztin.', 'Ich komme mit dem Zug.', 'Wir kommen zu spät.',
      'Ich fahre mit meinem Auto.', 'Wir sind zu Hause.', 'Wir kommen.', 'Ich spreche mit meiner Frau.',
      'Ich bin mit meiner Frau verheiratet.', 'Ich telefoniere mit meinem Bruder.', 'Ich möchte mit meinem Vater sprechen.',
      'Ich komme um acht Uhr.', 'Ich spreche mit meiner Frau. Ich komme am Montag.',
      'Ich wohne mit meinem Bruder. Ich fahre mit dem Bus.', 'Ich lerne mit meiner Frau Deutsch, ich komme aus Russland.',
      'Ich telefoniere mit meiner Mutter, sie kommt morgen.', 'Ich lerne mit meiner Frau Deutsch\nIch komme aus Russland']) {
      assert.equal(hasPersonCount(text), false, text);
    }
  });
});

describe('occupation detector', () => {
  it('needs an occupation, a role or a workplace, not just the verb "arbeiten"', () => {
    for (const text of ['Ich arbeite als Verkäufer.', 'Ich arbeite bei Siemens.', 'Zwei Personen, Ingenieur.', 'Ich bin Zahnärztin.', 'Wir sind Studenten.', 'Ich studiere Medizin.']) {
      assert.equal(hasOccupation(text), true, text);
    }
    for (const text of ['Wir sind zwei Personen und arbeiten beide.', 'Wir arbeiten hier.', 'Ich koche gern.', 'Ich habe viel Arbeit.',
      'Wir arbeiten für eine Umweltorganisation, um die Natur zu schützen.', 'Ich arbeite in Berlin.']) {
      assert.equal(hasOccupation(text), false, text);
    }
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
    assert.equal(policy.isVerdictReliable(['libe grüse, ich hofe dir get es gud, ich kan nich komen.']), false);
    assert.equal(policy.isVerdictReliable(['Was kostet das Zimmer und wann kann ich einziehen?']), true);
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
  const domainOf = (word) => resolveConceptDomain(word, policy.conceptDomains, policy.lexicon)?.[0] ?? null;

  it('credits compounds by their head', () => {
    assert.equal(domainOf('kurskosten'), domainOf('kosten'));
    assert.equal(domainOf('haustiere'), domainOf('tier'));
    assert.equal(domainOf('reparaturtermin'), domainOf('termin'));
    assert.equal(domainOf('anmeldung'), domainOf('anmelden'));
  });

  it('a bare "kommen" is not acceptance of an invitation', () => {
    for (const word of ['komme', 'kommt']) assert.notEqual(domainOf(word), domainOf('zusage'), word);
    assert.equal(domainOf('gern'), domainOf('zusage'));
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

  it('working without naming the occupation stays partial for Beruf', () => {
    const beruf = { label: 'Beruf', evidence: 'occupation', keywords: ['beruf', 'arbeit'] };
    assert.equal(policy.classifyScore(computeDeterministicFallbackScore(beruf, 'Wir arbeiten beide.', { policy })), 'partial');
    assert.equal(policy.classifyScore(computeDeterministicFallbackScore(beruf, 'Ich arbeite als Koch.', { policy })), 'full');
  });
});

describe('Declared evidence gate', async () => {
  const { hasDeclaredEvidenceSupport } = await import('../src/services/schreiben/grading/compoundBaselineEvaluator.js');
  const fehlen = { id: 'lp2', label: 'Wie lange Sie fehlen', evidence: 'temporal', keywords: ['tage', 'woche'] };

  it('needs the detector or a rubric keyword, not similarity to the query', () => {
    assert.equal(hasDeclaredEvidenceSupport(fehlen, 'Ich kann nicht kommen, weil mein Sohn krank ist.', { policy }), false);
    assert.equal(hasDeclaredEvidenceSupport(fehlen, 'Ich fehle bis Freitag.', { policy }), true);
    assert.equal(hasDeclaredEvidenceSupport(fehlen, 'Ich bleibe zwei Tage zu Hause.', { policy }), true);
    assert.equal(hasDeclaredEvidenceSupport({ label: 'Grund' }, 'Hallo.', { policy }), null);
  });
});

describe('Keyword stem match guarded by word class', async () => {
  const { findMatchedKeywords } = await import('../src/services/schreiben/linguistic/keywordStemMatcher.js');
  const words = (text) => text.split(/\s+/);

  it('a verb does not match a noun keyword with the same stem, a noun or an unknown word does', () => {
    assert.deepEqual(findMatchedKeywords(['wohnung'], words('Ich wohne in Berlin.'), policy.lexicon), []);
    assert.deepEqual(findMatchedKeywords(['wohnung'], words('Ist die Wohnung frei?'), policy.lexicon), ['wohnung']);
    assert.deepEqual(findMatchedKeywords(['anmelden'], words('Wie kann ich mich anmelden?'), policy.lexicon), ['anmelden']);
    assert.deepEqual(findMatchedKeywords(['wohnung'], words('ich möchte die wohnung mieten'), policy.lexicon), ['wohnung']);
  });
});

describe('Label overlap is read by the nouns of the label', async () => {
  const { computeFallbackEvidence } = await import('../src/services/schreiben/grading/rankerFallbackScorer.js');
  const lexical = (label, sentence) => computeFallbackEvidence({ label }, sentence, { policy }).lexical;
  it('a shared adjective alone does not cover the label', () => {
    assert.equal(policy.classifyScore(lexical('Neuer Terminvorschlag', 'Wir kaufen einen neuen Tisch.')), 'no');
  });

  it('one of two label nouns covers the label at most partially', () => {
    assert.equal(policy.classifyScore(lexical('Materialien für den Sprachkurs', 'Ich besuche den Sprachkurs.')), 'partial');
  });

  it('a sentence naming every noun of the label covers it', () => {
    assert.equal(policy.classifyScore(lexical('Hausaufgaben', 'Schicken Sie mir die Hausaufgaben.')), 'full');
  });
});
