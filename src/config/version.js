export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.7.6';
export const COMMIT_HASH = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'dev';
export const BUILD_TIME = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : '';

export function isDevEnvironment() {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return Boolean(import.meta.env.DEV);
  }
  return process.env.NODE_ENV !== 'production';
}

export function getVersionSummary() {
  const mode = isDevEnvironment() ? 'dev' : 'prod';
  return `v${APP_VERSION} (${mode} · ${COMMIT_HASH})`;
}

export function getVersionTooltip() {
  const mode = isDevEnvironment() ? 'Development Build' : 'Production Release';
  const parts = [`Version: v${APP_VERSION}`, `Commit: ${COMMIT_HASH}`, `Mode: ${mode}`];
  if (BUILD_TIME) {
    parts.push(`Built: ${BUILD_TIME}`);
  }
  return parts.join(' | ');
}
