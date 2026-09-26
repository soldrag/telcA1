/**
 * Replaces `{param}` placeholders with values; unknown placeholders are kept verbatim.
 * Framework-free so both React (I18nContext) and plain services can share it.
 */
export function interpolate(template, params) {
  if (typeof template !== 'string') return template ?? '';
  if (!params || typeof params !== 'object') return template;

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, paramName) => {
    return params[paramName] !== undefined ? String(params[paramName]) : match;
  });
}
