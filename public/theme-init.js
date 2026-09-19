// Synchronous early theme initialization to eliminate Flash of Unstyled Content (FOUC / FART)
(() => {
  try {
    const stored = localStorage.getItem('telc_app_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (stored !== 'light' && prefersDark);
    const root = document.documentElement;

    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';

    // Synchronized with src/hooks/useTheme.js (STORAGE_KEY and theme colors)
    const color = isDark ? '#0f172a' : '#f1f5f9';
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', color);

    const statusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (statusMeta) statusMeta.setAttribute('content', isDark ? 'black-translucent' : 'default');
  } catch {
    // Graceful fallback if localStorage is inaccessible
  }
})();
