import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { useExamTimer } from '../src/hooks/useExamTimer.js';

describe('useExamTimer Wall-Clock & Idle Management', () => {
  test('does not initiate interval when isRunning is false', () => {
    let effectCallback = null;

    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
      useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
      useCallback: (fn) => fn,
      useEffect: (effect) => {
        effectCallback = effect;
      },
      useRef: (val) => ({ current: val }),
    };

    const timer = useExamTimer({ initialSeconds: 1500, isRunning: false });
    assert.equal(timer.secondsLeft, 1500);

    // Call the effect: it should return undefined without setting intervals
    const cleanup = effectCallback();
    assert.equal(cleanup, undefined, 'Clean exit with no timer interval on idle');
  });

  test('initiates cleanup interval when isRunning is true', () => {
    let effectCallback = null;

    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
      useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
      useCallback: (fn) => fn,
      useEffect: (effect) => {
        effectCallback = effect;
      },
      useRef: (val) => ({ current: val }),
    };

    const timer = useExamTimer({ initialSeconds: 1500, isRunning: true });
    assert.equal(timer.secondsLeft, 1500);

    const cleanup = effectCallback();
    assert.equal(typeof cleanup, 'function', 'Cleanup function returned for running timer');
    cleanup();
  });
});
