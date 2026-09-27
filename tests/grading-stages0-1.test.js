import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runStage0Preprocessing, normalizeRawText, countWords } from '../src/services/schreiben/grading/stage0Preprocessing.js';
import { runStage1Scoring } from '../src/services/schreiben/grading/stage1SalutationClosing.js';
import { resolveLevelContext } from '../src/services/schreiben/levelContext.js';
import { DIAGNOSTIC_CODES } from '../src/services/schreiben/feedback/feedbackContracts.js';

const A1 = resolveLevelContext('A1');

describe('Stage 0 Preprocessing & Stage 1 Formula Scoring (Zero Models)', () => {
  it('normalizes raw text, strips CRLF and computes word counts accurately', () => {
    const raw = '  Hallo  Frau   Müller,\r\n\r\nich möchte Deutsch lernen.  \r\n\r\nViele Grüße\r\nAnna ';
    const norm = normalizeRawText(raw);
    assert.equal(norm.includes('\r'), false);
    assert.equal(countWords(norm), 10);
  });

  it('correctly segments formal salutation and closing with sender name', () => {
    const text = `Sehr geehrte Damen und Herren,
ich will einen Kurs im August buchen. Wann beginnt er?
Mit freundlichen Grüßen
Max Mustermann`;

    const stage0 = runStage0Preprocessing(text, A1);
    assert.equal(stage0.salutation.recognized, true);
    assert.match(stage0.salutation.text, /Sehr geehrte Damen und Herren/);
    assert.equal(stage0.closing.recognized, true);
    assert.match(stage0.closing.text, /Mit freundlichen Grüßen/);
    assert.equal(stage0.closing.senderName, 'Max Mustermann');
    assert.equal(stage0.bodySentences.length, 2);
    assert.match(stage0.bodySentences[0], /ich will einen Kurs/);
    assert.match(stage0.bodySentences[1], /Wann beginnt er/);
  });

  it('Stage 1 awards 2 points for formal salutation and 2 points for closing with full name', () => {
    const stage0 = runStage0Preprocessing(`Sehr geehrte Frau Dr. Schneider,
ich kann leider nicht kommen.
Mit freundlichen Grüßen
Erika Musterfrau`, A1);
    const stage1 = runStage1Scoring(stage0);

    assert.equal(stage1.anredeScore, 2);
    assert.equal(stage1.grussScore, 2);
    assert.equal(stage1.anrede.diagnosticCode, DIAGNOSTIC_CODES.ANREDE_PERFECT);
    assert.equal(stage1.gruss.diagnosticCode, DIAGNOSTIC_CODES.GRUSS_PERFECT);
  });

  it('Stage 1 awards 1 point for informal salutation in formal context or single name', () => {
    const stage0 = runStage0Preprocessing(`Hallo Herr Dr. Schneider,
ich kann nicht kommen.
Viele Grüße
Anna`, A1);
    const stage1 = runStage1Scoring(stage0);

    assert.equal(stage1.anredeScore, 1);
    assert.equal(stage1.grussScore, 1);
  });

  it('Stage 1 awards 0 points when salutation or closing is missing', () => {
    const stage0 = runStage0Preprocessing(`Ich habe keine Zeit am Montag.`, A1);
    const stage1 = runStage1Scoring(stage0);

    assert.equal(stage1.anredeScore, 0);
    assert.equal(stage1.grussScore, 0);
    assert.equal(stage1.anrede.diagnosticCode, DIAGNOSTIC_CODES.ANREDE_MISSING);
    assert.equal(stage1.gruss.diagnosticCode, DIAGNOSTIC_CODES.GRUSS_MISSING);
  });
});
