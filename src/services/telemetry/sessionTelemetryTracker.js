/**
 * Tracks session telemetry: Wall-Clock execution timestamps and tab switch (blur/hidden) events.
 */

export function createSessionTelemetryTracker({ initialStartedAt = null } = {}) {
  let startedAt = initialStartedAt ? new Date(initialStartedAt).toISOString() : null;
  let completedAt = null;
  let tabSwitches = 0;
  let active = false;
  let cleanupListeners = null;

  function handleVisibilityChange() {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden' && active) {
      tabSwitches += 1;
    }
  }

  function handleWindowBlur() {
    if (active) {
      tabSwitches += 1;
    }
  }

  function start() {
    if (!startedAt) {
      startedAt = new Date().toISOString();
    }
    active = true;

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);
      cleanupListeners = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
      };
    }
  }

  function stop() {
    active = false;
    if (cleanupListeners) {
      cleanupListeners();
      cleanupListeners = null;
    }
    if (!completedAt) {
      completedAt = new Date().toISOString();
    }
  }

  function getSummary() {
    const end = completedAt ? new Date(completedAt) : new Date();
    const startObj = startedAt ? new Date(startedAt) : end;
    const wallClockSeconds = Math.max(0, Math.round((end.getTime() - startObj.getTime()) / 1000));

    return {
      startedAt,
      completedAt,
      wallClockSeconds,
      tabSwitches,
    };
  }

  return {
    start,
    stop,
    getSummary,
    recordTabSwitch: () => { tabSwitches += 1; },
  };
}
