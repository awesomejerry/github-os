// Unit tests for Theme System

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
  removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
  clear: vi.fn(() => { localStorageMock.store = {}; })
};

// Mock document
const documentMock = {
  documentElement: {
    classList: {
      _classes: new Set(),
      remove: vi.fn((...classes) => {
        classes.forEach(c => documentMock.documentElement.classList._classes.delete(c));
      }),
      add: vi.fn((className) => {
        documentMock.documentElement.classList._classes.add(className);
      })
    }
  }
};

// Setup global mocks
global.localStorage = localStorageMock;
global.document = documentMock;

// Import after mocking
const { getCurrentTheme, setTheme, listThemes, THEMES, loadSavedTheme } = await import('../../scripts/themes.js');

describe('Theme System', () => {
  beforeEach(() => {
    // Reset mocks
    localStorageMock.store = {};
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    documentMock.documentElement.classList._classes.clear();
    documentMock.documentElement.classList.remove.mockClear();
    documentMock.documentElement.classList.add.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentTheme', () => {
    it('should return default theme initially', () => {
      const theme = getCurrentTheme();
      expect(theme).toBe('dark');
    });
  });

  describe('setTheme', () => {
    it('should set valid theme', () => {
      const result = setTheme('light');
      expect(result.success).toBe(true);
      expect(result.theme).toBe('light');
    });

    it('should reject invalid theme name', () => {
      const result = setTheme('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown theme');
    });

    it('should update localStorage when available', () => {
      setTheme('monokai');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'github_os_theme',
        JSON.stringify({ name: 'monokai' })
      );
    });

    it('should update DOM classList when document available', () => {
      setTheme('gruvbox');
      expect(documentMock.documentElement.classList.remove).toHaveBeenCalled();
      expect(documentMock.documentElement.classList.add).toHaveBeenCalledWith('theme-gruvbox');
    });

    it('should accept all defined themes', () => {
      const themeNames = Object.keys(THEMES);
      themeNames.forEach(name => {
        const result = setTheme(name);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('listThemes', () => {
    it('should return all themes', () => {
      const themes = listThemes();
      expect(themes.length).toBe(6);
    });

    it('should mark current theme', () => {
      setTheme('solarized-dark');
      const themes = listThemes();
      const current = themes.find(t => t.name === 'solarized-dark');
      expect(current.current).toBe(true);
    });

    it('should include theme metadata', () => {
      const themes = listThemes();
      themes.forEach(theme => {
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('label');
        expect(theme).toHaveProperty('current');
      });
    });
  });

  describe('loadSavedTheme', () => {
    it('should load saved theme from localStorage', () => {
      localStorageMock.store['github_os_theme'] = JSON.stringify({ name: 'light' });
      const loaded = loadSavedTheme();
      expect(loaded).toBe('light');
    });

    it('should default to dark if no saved theme', () => {
      const loaded = loadSavedTheme();
      expect(loaded).toBe('dark');
    });

    it('should default to dark for invalid saved theme', () => {
      localStorageMock.store['github_os_theme'] = JSON.stringify({ name: 'invalid' });
      const loaded = loadSavedTheme();
      expect(loaded).toBe('dark');
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.store['github_os_theme'] = 'not json';
      const loaded = loadSavedTheme();
      expect(loaded).toBe('dark');
    });
  });

  describe('THEMES constant', () => {
    it('should have all required themes', () => {
      expect(THEMES).toHaveProperty('dark');
      expect(THEMES).toHaveProperty('light');
      expect(THEMES).toHaveProperty('solarized-dark');
      expect(THEMES).toHaveProperty('solarized-light');
      expect(THEMES).toHaveProperty('monokai');
      expect(THEMES).toHaveProperty('gruvbox');
    });

    it('should have name and label for each theme', () => {
      Object.values(THEMES).forEach(theme => {
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('label');
      });
    });
  });
});
