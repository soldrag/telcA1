import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { useExamLoader } from '../src/hooks/useExamLoader.js';

function createHookHarness(hookFn) {
  const stateSlots = [];
  const refSlots = [];
  let slotIndex = 0;
  let refIndex = 0;
  let currentInstance = null;
  let lastArgs = [];

  const dispatcher = {
    useState: (initial) => {
      const idx = slotIndex++;
      if (stateSlots[idx] === undefined) {
        stateSlots[idx] = typeof initial === 'function' ? initial() : initial;
      }
      const setState = (action) => {
        stateSlots[idx] = typeof action === 'function' ? action(stateSlots[idx]) : action;
        run(...lastArgs);
      };
      return [stateSlots[idx], setState];
    },
    useCallback: (fn) => fn,
    useEffect: () => {},
    useRef: (val) => {
      const idx = refIndex++;
      if (!refSlots[idx]) refSlots[idx] = { current: val };
      return refSlots[idx];
    },
  };

  function run(...args) {
    lastArgs = args;
    slotIndex = 0;
    refIndex = 0;
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = dispatcher;
    currentInstance = hookFn(...args);
    return currentInstance;
  }

  return { run, get: () => currentInstance };
}

function createDeferredApi() {
  const pending = new Map();
  return {
    api: {
      fetchExams: async () => ({ exams: [] }),
      fetchTestTypes: async () => ({ testTypes: [] }),
      fetchExamDetails: (examId) => new Promise((resolve) => pending.set(examId, resolve)),
    },
    resolve: (examId) => pending.get(examId)({ exam: { id: examId } }),
  };
}

describe('useExamLoader: the latest exam request wins', () => {
  test('a late answer to an earlier request does not replace the exam of the latest request', async () => {
    const { api, resolve } = createDeferredApi();
    const harness = createHookHarness(useExamLoader);
    harness.run({ api });

    const first = harness.get().loadExamById('schreiben-modellsatz-1');
    const second = harness.get().loadExamById('schreiben-modellsatz-2');
    resolve('schreiben-modellsatz-2');
    await second;
    resolve('schreiben-modellsatz-1');
    const firstData = await first;

    assert.equal(harness.get().examData.exam.id, 'schreiben-modellsatz-2');
    assert.equal(firstData.exam.id, 'schreiben-modellsatz-1', 'the caller still receives its own exam');
  });

  test('the loading flag stays on until the latest request settles', async () => {
    const { api, resolve } = createDeferredApi();
    const harness = createHookHarness(useExamLoader);
    harness.run({ api });

    const first = harness.get().loadExamById('modellsatz-1');
    const second = harness.get().loadExamById('modellsatz-2');
    resolve('modellsatz-1');
    await first;
    assert.equal(harness.get().isLoadingExam, true);

    resolve('modellsatz-2');
    await second;
    assert.equal(harness.get().isLoadingExam, false);
  });
});
