import { useState, useEffect } from 'react';

// Initialize theme on page load (runs immediately outside React rendering context)
export function initTheme() {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    return savedTheme;
  }
  return 'dark';
}

// React hook to handle theme synchronization in active views
export function useTheme() {
  const [theme, setTheme] = useState(() => initTheme());

  useEffect(() => {
    // Keep data attribute in sync
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return [theme, toggleTheme];
}
