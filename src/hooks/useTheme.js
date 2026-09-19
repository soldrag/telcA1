import { useState, useEffect, useCallback } from 'react';

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

function applyResolvedTheme(resolved) {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
    root.style.backgroundColor = '#0f172a';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
    root.style.backgroundColor = '#f1f5f9';
  }
  applyThemeColor(resolved);
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return sanitizeTheme(stored);
    } catch {
      return 'system';
    }
  });

  const getResolvedTheme = useCallback((mode) => {
    const validMode = sanitizeTheme(mode);
    if (validMode === 'dark') return 'dark';
    if (validMode === 'light') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const [resolvedTheme, setResolvedTheme] = useState(() => getResolvedTheme(theme));

  useEffect(() => {
    const resolved = getResolvedTheme(theme);
    setResolvedTheme(resolved);
    applyResolvedTheme(resolved);
  }, [theme, getResolvedTheme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = mediaQuery.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      applyResolvedTheme(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState((prevTheme) => {
      const rawTheme = typeof newTheme === 'function' ? newTheme(prevTheme) : newTheme;
      const validTheme = sanitizeTheme(rawTheme);
      try {
        localStorage.setItem(STORAGE_KEY, validTheme);
      } catch {
        // ignore storage errors
      }
      return validTheme;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, [setTheme]);

  return {
    theme: sanitizeTheme(theme),
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  };
}
