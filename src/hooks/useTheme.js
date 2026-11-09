import { useState, useEffect, useCallback } from 'react';

// Synchronized with public/theme-init.js (STORAGE_KEY and theme colors)
const STORAGE_KEY = 'telc_app_theme';

function sanitizeTheme(val) {
  if (val === 'light' || val === 'dark' || val === 'system') return val;
  return 'system';
}

function applyThemeColor(resolved) {
  const color = resolved === 'dark' ? '#0f172a' : '#f1f5f9';
  const metaTags = document.querySelectorAll('meta[name="theme-color"]');
  if (metaTags.length > 0) {
    metaTags.forEach((tag) => {
      tag.removeAttribute('media');
      tag.setAttribute('content', color);
    });
  } else {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', color);
    document.head.appendChild(meta);
  }
}

function applyStatusBarMeta(resolved) {
  const statusBarStyle = resolved === 'dark' ? 'black-translucent' : 'default';
  const meta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (meta) {
    meta.setAttribute('content', statusBarStyle);
  }
}

function applyResolvedTheme(resolved) {
  const root = document.documentElement;
  const isDark = resolved === 'dark';
  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
  applyThemeColor(resolved);
  applyStatusBarMeta(resolved);
}

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const NEXT_THEME = { light: 'dark', dark: 'system', system: 'light' };

function resolveTheme(mode) {
  if (mode !== 'system') return mode;
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';
}

function readStoredTheme() {
  try {
    return sanitizeTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return 'system';
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the theme still applies for this visit.
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(readStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(theme));

  // Applies the theme now and, for "system", again whenever the OS scheme changes.
  useEffect(() => {
    const applyCurrentTheme = () => {
      const resolved = resolveTheme(theme);
      setResolvedTheme(resolved);
      applyResolvedTheme(resolved);
    };
    applyCurrentTheme();
    if (theme !== 'system') return undefined;
    const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY);
    mediaQuery.addEventListener('change', applyCurrentTheme);
    return () => mediaQuery.removeEventListener('change', applyCurrentTheme);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    const validTheme = sanitizeTheme(newTheme);
    storeTheme(validTheme);
    setThemeState(validTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((previousTheme) => {
      const nextTheme = NEXT_THEME[previousTheme];
      storeTheme(nextTheme);
      return nextTheme;
    });
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  };
}
