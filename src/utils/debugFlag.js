/**
 * Diagnostic panels (ranker internals, A/B comparison) are for developers only: opt in with ?debug in the URL.
 */
export function isDebugView() {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).has('debug');
  } catch {
    return false;
  }
}
