/**
 * PWA Service Worker registration and network status service.
 * Follows runtime feature detection and zero-dependency guidelines.
 */

export function isOnline() {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
}

export function subscribeNetworkStatus(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  // Only register in secure contexts (HTTPS or localhost)
  if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return null;
  }

  try {
    // Relative registration ensures compatibility with both root and subpath (GitHub Pages)
    const swUrl = new URL('./sw.js', window.location.href).href;
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: './'
    });

    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;
      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New content available
        }
      });
    });

    return registration;
  } catch (_error) {
    // Fail gracefully without interrupting app execution
    return null;
  }
}
