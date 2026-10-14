import test, { describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { buildExamDraft, isExamDraft, resolveDraftTimer } from '../src/utils/examDraft.js';
import { localExamDraft } from '../src/services/storage/examDraftStorage.js';

const session = { answers: { q1: 'a', letter: 'Liebe Anna, ...' }, activeTeil: 2, activeQuestionIndex: 3 };
const timer = { isTimed: true, totalSeconds: 1500, secondsLeft: 900, secondsElapsed: 600, isPaused: false };
const SAVED_AT = 1_000_000;

function installLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
  return store;
}

describe('exam draft: timer after a reload', () => {
  const draft = buildExamDraft({ examId: 'lesen-01', session, timer }, SAVED_AT);

  test('a timed exam keeps running while the page was closed', () => {
    assert.equal(resolveDraftTimer(draft, SAVED_AT + 120_000).secondsLeft, 780);
  });

  test('a paused exam keeps its reading', () => {
    const paused = { ...draft, isPaused: true };
    assert.equal(resolveDraftTimer(paused, SAVED_AT + 120_000).secondsLeft, 900);
  });

  test('time that ran out leaves zero, never a negative reading', () => {
    assert.equal(resolveDraftTimer(draft, SAVED_AT + 2_000_000).secondsLeft, 0);
  });

  test('practice without a timer resumes at the elapsed time it had, closed time not counted', () => {
    const practice = buildExamDraft({ examId: 'lesen-01', session, timer: { ...timer, isTimed: false } }, SAVED_AT);
    assert.equal(resolveDraftTimer(practice, SAVED_AT + 999_000).secondsLeft, 900);
  });
});

describe('exam draft: storage', () => {
  afterEach(() => { delete globalThis.localStorage; });

  test('reads back what was saved', () => {
    installLocalStorage();
    const draft = buildExamDraft({ examId: 'schreiben-02', session, timer }, SAVED_AT);
    localExamDraft.save(draft);
    assert.deepEqual(localExamDraft.read(), draft);
  });

  test('clear removes the draft', () => {
    installLocalStorage();
    localExamDraft.save(buildExamDraft({ examId: 'lesen-01', session, timer }, SAVED_AT));
    localExamDraft.clear();
    assert.equal(localExamDraft.read(), null);
  });

  test('corrupt or foreign data is ignored, not thrown', () => {
    installLocalStorage({ telc_exam_draft: '{not json' });
    assert.equal(localExamDraft.read(), null);
    installLocalStorage({ telc_exam_draft: JSON.stringify({ examId: 'x', answers: 'oops' }) });
    assert.equal(localExamDraft.read(), null);
    assert.equal(isExamDraft(null), false);
  });

  test('blocked storage means no draft, not a crash', () => {
    globalThis.localStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
    assert.equal(localExamDraft.read(), null);
    localExamDraft.save(buildExamDraft({ examId: 'lesen-01', session, timer }, SAVED_AT));
    localExamDraft.clear();
  });
});
