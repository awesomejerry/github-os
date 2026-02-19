const STORAGE_KEY = 'github_os_theme';

export const THEMES = {
  dark: { name: 'dark', label: 'Dark (default)' },
  light: { name: 'light', label: 'Light' },
  'solarized-dark': { name: 'solarized-dark', label: 'Solarized Dark' },
  'solarized-light': { name: 'solarized-light', label: 'Solarized Light' },
  monokai: { name: 'monokai', label: 'Monokai' },
  gruvbox: { name: 'gruvbox', label: 'Gruvbox' }
};

const DEFAULT_THEME = 'dark';

let currentTheme = DEFAULT_THEME;

export function getCurrentTheme() {
  return currentTheme;
}

export function setTheme(themeName) {
  if (!THEMES[themeName]) {
    return { success: false, error: `Unknown theme: ${themeName}` };
  }
  
  const html = document.documentElement;
  
  html.classList.remove(...Object.keys(THEMES).map(t => `theme-${t}`));
  
  html.classList.add(`theme-${themeName}`);
  
  currentTheme = themeName;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: themeName }));
  
  return { success: true, theme: themeName };
}

export function listThemes() {
  return Object.values(THEMES).map(theme => ({
    ...theme,
    current: theme.name === currentTheme
  }));
}

export function loadSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { name } = JSON.parse(saved);
      if (THEMES[name]) {
        setTheme(name);
        return name;
      }
    }
  } catch {
    // Invalid data, fall back to default
  }
  
  setTheme(DEFAULT_THEME);
  return DEFAULT_THEME;
}

loadSavedTheme();
