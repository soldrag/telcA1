import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveAddresseeRegister } from '../src/services/schreiben/letterRegister.js';
import { gradeLetter } from './helpers/gradeLetter.js';

const taskFor = (addresseeRegister) => ({
  id: `register-${addresseeRegister ?? 'none'}`,
  level: 'A1',
  options_json: {
    leitpunkte: ['Wann', 'Wo', 'Was mitbringen'],
    rubric: {
      ...(addresseeRegister ? { addresseeRegister } : {}),
      leitpunkte_criteria: [
        { id: 'lp1', label: 'Wann', intent: 'GENERAL', evidence: 'temporal', keywords: ['samstag', 'uhr'], requiredMatches: 1 },
        { id: 'lp2', label: 'Wo', intent: 'GENERAL', keywords: ['park', 'café'], requiredMatches: 1 },
        { id: 'lp3', label: 'Was mitbringen', intent: 'ACTION_REQUEST', keywords: ['mitbringen', 'kuchen'], requiredMatches: 1 },
      ],
    },
  },
});

const toFriend = 'Lieber Paul,\nwir treffen uns am Samstag um 15 Uhr im Park. Bring bitte einen Kuchen mit.\nViele Grüße\nMara';
const toOffice = 'Sehr geehrte Damen und Herren,\nwir treffen uns am Samstag um 15 Uhr im Park. Bitte bringen Sie einen Kuchen mit.\nMit freundlichen Grüßen\nMara Berg';

describe('addressee register (rubric data)', () => {
  it('reads the register the task declares', () => {
    assert.equal(resolveAddresseeRegister(taskFor('informal')), 'informal');
    assert.equal(resolveAddresseeRegister(taskFor('formal')), 'formal');
  });

  it('treats a task without the field as formal (legacy data) and rejects an unknown value', () => {
    assert.equal(resolveAddresseeRegister(taskFor()), 'formal');
    assert.equal(resolveAddresseeRegister({}), 'formal');
    assert.throws(() => resolveAddresseeRegister(taskFor('casual')), RangeError);
  });

  it('gives informal formulas the full Kommunikative Gestaltung point in a letter to a friend', async () => {
    const result = await gradeLetter(toFriend, taskFor('informal'));
    assert.equal(result.breakdown.kommunikative_gestaltung.points, 1);
  });

  it('still rates informal formulas as atypical when the task asks for a formal letter', async () => {
    const result = await gradeLetter(toFriend, taskFor('formal'));
    assert.equal(result.breakdown.kommunikative_gestaltung.points, 0.5);
  });

  it('keeps formal formulas appropriate in a formal task', async () => {
    const result = await gradeLetter(toOffice, taskFor('formal'));
    assert.equal(result.breakdown.kommunikative_gestaltung.points, 1);
  });
});
