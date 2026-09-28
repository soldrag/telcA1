/**
 * Tells whether the model weights are already in the browser's Cache Storage, where transformers.js keeps them.
 * transformers.js reports reading a cached file with the same progress events as a download, so without this
 * check every grading (a fresh worker reads the cached weights again) would look like a new download.
 * Not ModelRegistry.is_pipeline_cached: for this model it also wants generation_config.json, which the pipeline
 * never caches, so it always answers «not cached» (checked in the browser, transformers.js 4.2).
 */

const REVISION = 'main';

// The cache key is the remote URL, built as transformers.js buildResourcePaths does for the default revision.
function buildRemoteUrl(env, modelId, file) {
  const host = String(env.remoteHost || '').replace(/\/$/, '');
  const path = String(env.remotePathTemplate || '')
    .replaceAll('{model}', modelId)
    .replaceAll('{revision}', encodeURIComponent(REVISION))
    .replace(/^\//, '')
    .replace(/\/$/, '');
  return `${host}/${path}/${file}`;
}

/**
 * @param {{ env: object, modelId: string, files: string[] }} request
 * @returns {Promise<boolean>} false when the Cache API is unavailable, a file is missing or the check fails.
 */
export async function areModelFilesCached({ env, modelId, files }) {
  if (!env?.useBrowserCache || typeof caches === 'undefined') return false;
  try {
    const cache = await caches.open(env.cacheKey);
    const matches = await Promise.all(files.map((file) => cache.match(buildRemoteUrl(env, modelId, file))));
    return matches.every(Boolean);
  } catch {
    return false;
  }
}
