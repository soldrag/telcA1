import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'telc_app_theme';

function sanitizeTheme(val) {
  if (val === 'light' || val === 'dark' || val === 'system') return val;
  return 'system';
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
    const root = document.documentElement;
    const resolved = getResolvedTheme(theme);
    setResolvedTheme(resolved);

    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, getResolvedTheme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = mediaQuery.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
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
