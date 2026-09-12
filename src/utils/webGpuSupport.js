/**
 * Runtime Feature Detection for WebGPU / NPU (Platform API Compliance).
 * Strictly complies with Rule 9: relies on navigator.gpu + requestAdapter(),
 * never on user-agent sniffing or outdated training knowledge.
 */

let cachedAdapterAvailable = null;

export async function isWebGPUAdapterAvailable() {
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    cachedAdapterAvailable = false;
    return false;
  }
  if (cachedAdapterAvailable !== null) {
    return cachedAdapterAvailable;
  }
  try {
    if (typeof navigator.gpu.requestAdapter === 'function') {
      const adapter = await navigator.gpu.requestAdapter();
      cachedAdapterAvailable = Boolean(adapter);
      return cachedAdapterAvailable;
    }
    cachedAdapterAvailable = true;
    return true;
  } catch {
    cachedAdapterAvailable = false;
    return false;
  }
}

export function isWebGPUSupported() {
  if (cachedAdapterAvailable !== null) {
    return cachedAdapterAvailable;
  }
  return typeof navigator !== 'undefined' && Boolean(navigator.gpu);
}
