/**
 * Runtime Feature Detection for WebGPU (Platform API Compliance, CLAUDE.md §9).
 * Relies on navigator.gpu + requestAdapter(), never on user-agent sniffing: a browser that exposes
 * navigator.gpu without a usable adapter must take the WASM path. A software fallback adapter (SwiftShader) is not
 * usable either: on SwiftShader (headless Chromium) the 300M embedding model did not finish within 100 s, the WASM path
 * took about 4 s. Works on the main thread and in workers.
 */

/** `isFallbackAdapter` moved from the adapter to `adapter.info` in the WebGPU spec; browsers expose either. */
const isSoftwareAdapter = (adapter) => Boolean(adapter.info?.isFallbackAdapter ?? adapter.isFallbackAdapter);

/**
 * @param {Navigator|undefined} nav - the environment's navigator (WorkerNavigator inside a worker)
 * @returns {Promise<boolean>}
 */
export async function isWebGPUAdapterAvailable(nav = globalThis.navigator) {
  if (typeof nav?.gpu?.requestAdapter !== 'function') return false;
  try {
    const adapter = await nav.gpu.requestAdapter();
    return Boolean(adapter) && !isSoftwareAdapter(adapter);
  } catch {
    return false;
  }
}
