import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'md2wx_dark_mode';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch { return false; }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try { localStorage.setItem(STORAGE_KEY, String(isDark)); } catch {}
  }, [isDark]);

  const toggle = useCallback(() => setIsDark(v => !v), []);

  return { isDark, toggle };
}
