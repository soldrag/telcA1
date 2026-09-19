// Early theme initialization to eliminate Flash of Unstyled Content (FOUC)
(() => {
  try {
    const stored = localStorage.getItem('telc_app_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored === 'dark' || (stored !== 'light' && prefersDark);
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
      root.style.backgroundColor = '#0f172a';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f1f5f9';
    }
  } catch {
    // Graceful fallback if localStorage is inaccessible
  }
})();
