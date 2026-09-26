import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { seedData } from '../server/seed-data.js';
import { MODULE_RULE_FIELDS, getTestTypeById } from '../shared/testTypes.js';

const SEEDS_DIR = join(process.cwd(), 'server/seeds');

async function loadRawSeedExams() {
  const files = readdirSync(SEEDS_DIR).filter((name) => name.endsWith('.js'));
  const modules = await Promise.all(files.map((name) => import(pathToFileURL(join(SEEDS_DIR, name)).href)));
  return modules.flatMap((mod) => [mod.exam, ...(mod.moduleExams || [])].filter(Boolean));
}

describe('module rules live only in shared/testTypes.js', () => {
  it('seed variants do not declare module-wide rule fields', async () => {
    const offenders = (await loadRawSeedExams()).flatMap((exam) =>
      MODULE_RULE_FIELDS.filter((field) => field in exam).map((field) => `${exam.id}.${field}`));
    assert.deepEqual(offenders, []);
  });

  it('every exam inherits time limit and pass score from its module', () => {
    for (const exam of seedData.exams) {
      const rules = getTestTypeById(exam.test_type || 'lesen');
      assert.equal(exam.time_limit_minutes, rules.timeLimitMinutes, exam.id);
      assert.equal(exam.pass_score, rules.passScore, exam.id);
    }
  });
});
