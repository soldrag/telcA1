import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  scrollToTop,
  scrollToExamHeader,
  scrollToElement,
  lockBodyScroll,
  unlockBodyScroll,
} from '../src/utils/scrollService.js';

describe('Scroll Service', () => {
  let originalWindow;
  let originalDocument;
  let scrollToCalls;

  beforeEach(() => {
    originalWindow = globalThis.window;
    originalDocument = globalThis.document;
    scrollToCalls = [];

    globalThis.window = {
      scrollTo: (opts) => {
        scrollToCalls.push(opts);
      },
    };

    globalThis.document = {
      body: { style: {} },
      documentElement: { scrollTop: 100 },
      getElementById: () => null,
    };
  });

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });

  it('scrollToTop defaults to top: 0, left: 0, behavior: "auto"', () => {
    scrollToTop();
    assert.equal(scrollToCalls.length, 1);
    assert.deepEqual(scrollToCalls[0], { top: 0, left: 0, behavior: 'auto' });
  });

  it('scrollToTop supports custom behavior like "smooth"', () => {
    scrollToTop('smooth');
    assert.equal(scrollToCalls.length, 1);
    assert.deepEqual(scrollToCalls[0], { top: 0, left: 0, behavior: 'smooth' });
  });

  it('scrollToTop falls back to scrollTop when window.scrollTo is unavailable', () => {
    delete globalThis.window.scrollTo;
    globalThis.document.documentElement.scrollTop = 500;
    globalThis.document.body.scrollTop = 500;

    scrollToTop();
    assert.equal(globalThis.document.documentElement.scrollTop, 0);
    assert.equal(globalThis.document.body.scrollTop, 0);
  });

  it('scrollToExamHeader calls scrollTo with specified offset and default auto behavior', () => {
    scrollToExamHeader(120);
    assert.equal(scrollToCalls.length, 1);
    assert.deepEqual(scrollToCalls[0], { top: 120, left: 0, behavior: 'auto' });
  });

  it('scrollToElement calls scrollIntoView on the target element if found', () => {
    let scrollIntoViewCalled = false;
    let scrollIntoViewOptions = null;

    globalThis.document.getElementById = (id) => {
      if (id === 'question-5') {
        return {
          scrollIntoView: (opts) => {
            scrollIntoViewCalled = true;
            scrollIntoViewOptions = opts;
          },
        };
      }
      return null;
    };

    scrollToElement('question-5', { behavior: 'smooth', block: 'center' });
    assert.equal(scrollIntoViewCalled, true);
    assert.deepEqual(scrollIntoViewOptions, { behavior: 'smooth', block: 'center' });
  });

  it('scrollToElement does nothing gracefully when element is not found', () => {
    assert.doesNotThrow(() => {
      scrollToElement('non-existent');
    });
  });

  it('lockBodyScroll sets body overflow to hidden', () => {
    lockBodyScroll();
    assert.equal(globalThis.document.body.style.overflow, 'hidden');
  });

  it('unlockBodyScroll clears body overflow', () => {
    globalThis.document.body.style.overflow = 'hidden';
    unlockBodyScroll();
    assert.equal(globalThis.document.body.style.overflow, '');
  });
});
