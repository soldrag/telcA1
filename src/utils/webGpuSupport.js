/**
 * Runtime Feature Detection for WebGPU (Platform API Compliance, CLAUDE.md §9).
 * Relies on navigator.gpu + requestAdapter(), never on user-agent sniffing: a browser that exposes
 * navigator.gpu without a usable adapter must take the WASM path. Works on the main thread and in workers.
 */

/**
 * @param {Navigator|undefined} nav - the environment's navigator (WorkerNavigator inside a worker)
 * @returns {Promise<boolean>}
 */
export async function isWebGPUAdapterAvailable(nav = globalThis.navigator) {
  if (typeof nav?.gpu?.requestAdapter !== 'function') return false;
  try {
    return Boolean(await nav.gpu.requestAdapter());
  } catch {
    return false;
  }
}
