// E2E tests for theme command
// Tests the full command execution flow from user input perspective

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
  removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
  clear: vi.fn(() => { localStorageMock.store = {}; })
};
global.localStorage = localStorageMock;

// Mock document
const classListMock = {
  classes: new Set(['theme-dark']),
  remove: vi.fn(),
  add: vi.fn()
};
global.document = {
  documentElement: {
    classList: classListMock
  }
};

// Mock auth
vi.mock('../../scripts/auth.js', () => ({
  isAuthenticated: vi.fn(() => false),
  getAccessToken: vi.fn(() => null)
}));

vi.mock('../../scripts/session.js', () => ({
  loadSession: vi.fn(() => null),
  isAuthenticated: vi.fn(() => false),
  getAccessToken: vi.fn(() => null)
}));

// Import commands after mocks
const { commands } = await import('../../scripts/commands.js');

// Simulates how app.js calls commands
function simulateCommand(cmd, args = []) {
  const terminal = {
    print: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    getPath: vi.fn(() => '/'),
    focus: vi.fn()
  };
  const githubUser = 'testuser';
  
  // This is exactly how app.js calls commands:
  // commands[cmd](this.terminal, this.githubUser, args, this)
  commands[cmd](terminal, githubUser, args);
  
  return terminal;
}

describe('E2E: theme command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.store = {};
    classListMock.classes = new Set(['theme-dark']);
  });

  describe('simulate user typing "theme"', () => {
    it('should show current theme (not "Unknown theme command: a")', async () => {
      // Simulate: user types "theme" and presses Enter
      // In app.js: commands['theme'](terminal, githubUser, [])
      const terminal = simulateCommand('theme', []);
      
      const outputCalls = terminal.print.mock.calls;
      const outputText = outputCalls.map(c => c[0]).join(' ');
      
      // Should show current theme
      expect(outputText).toContain('Current theme');
      
      // Should NOT show the bug we fixed
      expect(outputText).not.toContain('Unknown theme command: a');
      expect(outputText).not.toContain('Unknown theme command');
    });
  });

  describe('simulate user typing "theme list"', () => {
    it('should show list of available themes', async () => {
      const terminal = simulateCommand('theme', ['list']);
      
      const outputCalls = terminal.print.mock.calls;
      const outputText = outputCalls.map(c => c[0]).join(' ');
      
      expect(outputText).toContain('Available themes');
      expect(outputText).toContain('dark');
      expect(outputText).toContain('light');
    });
  });

  describe('simulate user typing "theme set light"', () => {
    it('should change theme to light', async () => {
      const terminal = simulateCommand('theme', ['set', 'light']);
      
      const outputCalls = terminal.print.mock.calls;
      const outputText = outputCalls.map(c => c[0]).join(' ');
      
      expect(outputText).toContain('Theme set to');
      expect(outputText).toContain('Light');
    });

    it('should update DOM classList', async () => {
      simulateCommand('theme', ['set', 'light']);
      
      expect(classListMock.remove).toHaveBeenCalled();
      expect(classListMock.add).toHaveBeenCalledWith('theme-light');
    });

    it('should save to localStorage', async () => {
      simulateCommand('theme', ['set', 'light']);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'github_os_theme',
        JSON.stringify({ name: 'light' })
      );
    });
  });

  describe('simulate user typing invalid theme command', () => {
    it('should show error for unknown subcommand', async () => {
      const terminal = simulateCommand('theme', ['invalid']);
      
      const outputCalls = terminal.print.mock.calls;
      const outputText = outputCalls.map(c => c[0]).join(' ');
      
      expect(outputText).toContain('Unknown theme command: invalid');
    });

    it('should show usage help', async () => {
      const terminal = simulateCommand('theme', ['invalid']);
      
      const outputCalls = terminal.print.mock.calls;
      const outputText = outputCalls.map(c => c[0]).join(' ');
      
      expect(outputText).toContain('Usage');
    });
  });

  describe('simulate user typing "theme set" without theme name', () => {
    it('should show usage error', async () => {
      const terminal = simulateCommand('theme', ['set']);
      
      const outputCalls = terminal.print.mock.calls;
      const outputText = outputCalls.map(c => c[0]).join(' ');
      
      expect(outputText).toContain('Usage: theme set');
    });
  });

  describe('simulate user typing "theme set nonexistent"', () => {
    it('should show error for invalid theme', async () => {
      const terminal = simulateCommand('theme', ['set', 'nonexistent']);
      
      const outputCalls = terminal.print.mock.calls;
      const outputText = outputCalls.map(c => c[0]).join(' ');
      
      expect(outputText).toContain('Unknown theme: nonexistent');
    });

    it('should show available themes', async () => {
      const terminal = simulateCommand('theme', ['set', 'nonexistent']);
      
      const outputCalls = terminal.print.mock.calls;
      const outputText = outputCalls.map(c => c[0]).join(' ');
      
      expect(outputText).toContain('Available themes');
    });
  });
});
