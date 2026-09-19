// Early theme initialization to eliminate Flash of Unstyled Content (FOUC)
(() => {
  try {
    const stored = localStorage.getItem('telc_app_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (stored !== 'light' && prefersDark);
    const root = document.documentElement;

    const color = isDark ? '#0f172a' : '#f1f5f9';
    const statusBarStyle = isDark ? 'black-translucent' : 'default';

    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', color);

    const statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (statusBarMeta) statusBarMeta.setAttribute('content', statusBarStyle);
  } catch {
    // Graceful fallback if localStorage is inaccessible
  }
})();
