/**
 * Client-side debug telemetry dispatcher.
 * Logs to browser console (grouped) and POSTs to /api/debug/trace.
 */

const TRACE_ENDPOINT = '/api/debug/trace';

function isDebugMode() {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost'
    || window.location.search.includes('debug=true');
}

function consoleTrace(category, message, data) {
  if (typeof console.groupCollapsed !== 'function') return;
  console.groupCollapsed(`[${category}] ${message}`);
  if (data) console.log(data);
  console.groupEnd();
}

function postTrace(category, message, data) {
  const payload = JSON.stringify({ category, message, data });
  if (typeof navigator?.sendBeacon === 'function') {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(TRACE_ENDPOINT, blob);
    return;
  }
  fetch(TRACE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

export function trace(category, message, data = null) {
  if (!isDebugMode()) return;
  consoleTrace(category, message, data);
  postTrace(category, message, data);
}

export function tracePrompt(prompt) {
  trace('LLM-PROMPT', 'Prompt sent to model', { prompt });
}

export function traceRawResponse(raw) {
  trace('LLM-RAW', 'Raw model output', { raw });
}

export function traceParsedResult(parsed) {
  trace('LLM-PARSED', 'Parsed JSON result', parsed);
}

export function traceArbitration(diff) {
  trace('ARBITRATOR', 'Arbitration result', diff);
}
