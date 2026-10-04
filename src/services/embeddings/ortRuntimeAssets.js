/**
 * Where the ONNX runtime's wasm loader and binary come from: the app's own files, never a CDN
 * (CLAUDE.md §0: static hosting, offline, no third-party requests). transformers.js points them at jsdelivr by default.
 * The WebGPU path uses the asyncify build; the CPU (WASM) path the plain build — observed on onnxruntime-web
 * 1.26.0-dev.20260416: the asyncify build has no CPU kernel for the q4 model's GatherBlockQuantized, no session is created.
 */

// In Node (tests, bench) onnxruntime-node brings its own runtime and the Vite `?url` imports below do not resolve.
const isBrowserRuntime = () => typeof document !== 'undefined' || typeof WorkerGlobalScope !== 'undefined';

const loadAssetUrls = {
  webgpu: () => Promise.all([
    import('onnxruntime-web/ort-wasm-simd-threaded.asyncify.mjs?url'),
    import('onnxruntime-web/ort-wasm-simd-threaded.asyncify.wasm?url'),
  ]),
  wasm: () => Promise.all([
    import('onnxruntime-web/ort-wasm-simd-threaded.mjs?url'),
    import('onnxruntime-web/ort-wasm-simd-threaded.wasm?url'),
  ]),
};

/** @param {{ backends?: { onnx?: { wasm?: object } } }} env - the transformers.js env; @param {'webgpu'|'wasm'} device */
export async function pointOrtToOwnAssets(env, device) {
  const wasmEnv = env?.backends?.onnx?.wasm;
  if (!wasmEnv || !isBrowserRuntime()) return;
  const [mjs, wasm] = await loadAssetUrls[device]();
  wasmEnv.wasmPaths = { mjs: mjs.default, wasm: wasm.default };
}
