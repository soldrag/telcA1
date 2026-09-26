import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { classifyCriterionCoverage } from '../src/services/schreiben/grading/microRankerService.js';
import { defaultA1RankerPolicy } from '../src/services/schreiben/grading/policies/a1RankerPolicy.js';

describe('Ranking Rules Generalization Tests (Zero Task Overfitting)', () => {
  it('generalizes to Fahrradverleih task (Compound: Dauer und Kosten)', async () => {
    const criterion = { label: 'Dauer und Kosten', aspects: [{ label: 'Dauer', evidence: 'temporal' }, { label: 'Kosten' }] };

    // Letter 1: Both aspects present
    const resFull = await classifyCriterionCoverage(
      criterion,
      ['Ich möchte ein Fahrrad für drei Tage mieten. Wie viel kostet das pro Tag?'],
      { policy: defaultA1RankerPolicy }
    );
    assert.equal(resFull.isCompound, true);
    assert.equal(resFull.coverage, 'full');
    assert.ok(resFull.fulfilledAspects.includes('Dauer'));
    assert.ok(resFull.fulfilledAspects.includes('Kosten'));

    // Letter 2: Missing Dauer (Trap letter)
    const resPartial = await classifyCriterionCoverage(
      criterion,
      ['Ich möchte ein Fahrrad mieten. Wie viel kostet das pro Tag?'],
      { policy: defaultA1RankerPolicy }
    );
    assert.equal(resPartial.isCompound, true);
    assert.equal(resPartial.coverage, 'partial');
    assert.ok(resPartial.missingAspects.includes('Dauer'));
    assert.ok(resPartial.fulfilledAspects.includes('Kosten'));

    // Letter 3: Completely off-topic
    const resNo = await classifyCriterionCoverage(
      criterion,
      ['Das Wetter in Berlin ist sehr schön und ich esse Pizza.'],
      { policy: defaultA1RankerPolicy }
    );
    assert.equal(resNo.coverage, 'no');
  });

  it('generalizes to Arzttermin task (Compound: Grund und Termin)', async () => {
    const criterion = 'Grund und Termin';

    // Both Grund (Bauchschmerzen/krank) and Termin (Montag 14 Uhr)
    const resFull = await classifyCriterionCoverage(
      criterion,
      ['Ich bin krank und habe Bauchschmerzen.', 'Kann ich am Montag um 14 Uhr vorbeikommen?'],
      { policy: defaultA1RankerPolicy }
    );
    assert.equal(resFull.coverage, 'full');
    assert.ok(resFull.fulfilledAspects.includes('Grund'));
    assert.ok(resFull.fulfilledAspects.includes('Termin'));

    // Grund only
    const resGrundOnly = await classifyCriterionCoverage(
      criterion,
      ['Ich bin krank und habe Fieber.'],
      { policy: defaultA1RankerPolicy }
    );
    assert.equal(resGrundOnly.coverage, 'partial');
    assert.ok(resGrundOnly.missingAspects.includes('Termin'));
  });

  it('handles varied conjunctions (sowie, /) domain-agnostically', async () => {
    // With 'sowie'
    const critSowie = 'Anreise sowie Übernachtung';
    const resSowie = await classifyCriterionCoverage(
      critSowie,
      ['Ich komme mit dem Zug an und brauche ein Zimmer im Hotel.'],
      { policy: defaultA1RankerPolicy }
    );
    assert.equal(resSowie.isCompound, true);

    // With '/'
    const critSlash = 'Preis / Bezahlung';
    const resSlash = await classifyCriterionCoverage(
      critSlash,
      ['Wie viel kostet das und kann ich mit Karte bezahlen?'],
      { policy: defaultA1RankerPolicy }
    );
    assert.equal(resSlash.isCompound, true);
  });
});
