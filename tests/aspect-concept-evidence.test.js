/**
 * Aspect concept evidence: a sentence that states an aspect through the level's concept domains
 * ("Ist die Wohnung billig?" → Preis) is found by retrieval and segmentation, not only rubric keywords.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hasAspectConceptEvidence } from '../src/services/schreiben/grading/aspectConceptEvidence.js';
import { segmentUserEssay } from '../src/services/schreiben/schreibenTextSegmenter.js';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';
import { questions } from '../server/seeds/schreiben-modellsatz-4.js';

const A1 = resolveLevelContext('A1');
const { policy } = A1;
const ostsee = questions.find((q) => q.id === 's4-q6');
const [grund, personenZeitraum, preisHaustiere] = ostsee.options_json.rubric.leitpunkte_criteria;

describe('aspect concept evidence', () => {
  it('finds a price question without a rubric keyword', () => {
    for (const s of ['Ist die Wohnung billig?', 'Ist die Wohnung teuer?', 'Wie viel kostet das?']) {
      assert.equal(hasAspectConceptEvidence(preisHaustiere, s, { policy }), true, s);
    }
  });

  it('does not read "viel" of thanks or quantities as a price', () => {
    for (const s of ['Vielen Dank für Ihre Antwort.', 'Wir haben viele Fragen.', 'Ich habe viel Zeit.', 'Die Wohnung ist schön.']) {
      assert.equal(hasAspectConceptEvidence(preisHaustiere, s, { policy }), false, s);
    }
  });

  it('stays with its own Leitpunkt: a price question is no reason and no period', () => {
    assert.equal(hasAspectConceptEvidence(grund, 'Ist die Wohnung billig?', { policy }), false);
    assert.equal(hasAspectConceptEvidence(personenZeitraum, 'Ist die Wohnung billig?', { policy }), false);
  });

  it('needs the level policy', () => {
    assert.throws(() => hasAspectConceptEvidence(preisHaustiere, 'Ist die Wohnung billig?', {}));
  });
});

describe('segmentation reads the same level data', () => {
  it('assigns "Ist die Wohnung billig?" to Preis und Haustiere, not to the reason by its noun "Wohnung"', () => {
    const text = 'Hallo Frau Hansen,\n\nich suche eine Ferienwohnung an der Ostsee für Urlaub.\nWir sind vier Personen im August.\nIst die Wohnung billig?\n\nViele Grüße\nAlex Schmidt';
    const segments = segmentUserEssay(text, ostsee.options_json.rubric.leitpunkte_criteria, A1);
    assert.deepEqual(segments.leitpunkte.map((lp) => lp.sentences), [
      ['ich suche eine Ferienwohnung an der Ostsee für Urlaub.'],
      ['Wir sind vier Personen im August.'],
      ['Ist die Wohnung billig?'],
    ]);
  });
});
