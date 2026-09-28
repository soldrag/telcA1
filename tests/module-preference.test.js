import test, { describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { localModulePreference } from '../src/services/storage/modulePreferenceStorage.js';
import { useExamLoader } from '../src/hooks/useExamLoader.js';
import { TEST_TYPES } from '../shared/testTypes.js';

function installLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
  };
  return store;
}

const upcomingModule = TEST_TYPES.find((type) => type.status !== 'active').id;

describe('module preference: the chosen module survives a reload', () => {
  afterEach(() => { delete globalThis.localStorage; });

  test('reads back the module saved before', () => {
    installLocalStorage();
    localModulePreference.save('schreiben');
    assert.equal(localModulePreference.read(), 'schreiben');
  });

  test('opens the default module when nothing, an unknown or a not yet playable module is stored', () => {
    installLocalStorage();
    assert.equal(localModulePreference.read(), 'lesen');
    installLocalStorage({ telc_active_module: 'mathe' });
    assert.equal(localModulePreference.read(), 'lesen');
    installLocalStorage({ telc_active_module: upcomingModule });
    assert.equal(localModulePreference.read(), 'lesen');
  });

  test('does not store a module that cannot be played', () => {
    const store = installLocalStorage();
    localModulePreference.save(upcomingModule);
    assert.equal(store.size, 0);
  });

  test('falls back to the default module when storage is blocked', () => {
    globalThis.localStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    assert.equal(localModulePreference.read(), 'lesen');
    assert.doesNotThrow(() => localModulePreference.save('schreiben'));
  });
});

describe('useExamLoader: the module comes from the preference port', () => {
  test('starts with the preferred module and saves only the one the student chooses, not a link-driven switch', () => {
    const saved = [];
    const modulePreference = { read: () => 'schreiben', save: (id) => saved.push(id) };
    const slots = [];
    let index = 0;
    let instance = null;
    const render = () => {
      index = 0;
      React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = {
        useState: (initial) => {
          const idx = index++;
          if (!(idx in slots)) slots[idx] = typeof initial === 'function' ? initial() : initial;
          return [slots[idx], (value) => { slots[idx] = value; render(); }];
        },
        useCallback: (fn) => fn,
        useEffect: () => {},
        useRef: (value) => ({ current: value }),
      };
      instance = useExamLoader({ modulePreference });
    };
    render();

    assert.equal(instance.activeTestType, 'schreiben');
    instance.changeTestType('lesen');
    assert.equal(instance.activeTestType, 'lesen');
    assert.deepEqual(saved, [], 'an assignment or review link switches the module without remembering it');
    instance.chooseTestType('schreiben');
    assert.equal(instance.activeTestType, 'schreiben');
    assert.deepEqual(saved, ['schreiben']);
  });
});
