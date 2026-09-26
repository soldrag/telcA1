/**
 * Fail-fast guard for level ports: engine modules never fall back to a default level.
 */
export function requireLevelPort(port, name) {
  if (!port) throw new TypeError(`${name} is required: pass the level context (resolveLevelContext(question.level))`);
  return port;
}
