// Integration tests for theme command
// This test verifies the command is called with correct parameters

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock themes module
vi.mock('../../scripts/themes.js', () => ({
  getCurrentTheme: vi.fn(() => 'dark'),
  setTheme: vi.fn((name) => ({ success: true, theme: name })),
  listThemes: vi.fn(() => [
    { name: 'dark', label: 'Dark', current: true },
    { name: 'light', label: 'Light', current: false }
  ]),
  THEMES: {
    dark: { name: 'dark', label: 'Dark (default)' },
    light: { name: 'light', label: 'Light' }
  }
}));

// Mock session
vi.mock('../../scripts/session.js', () => ({
  loadSession: vi.fn(() => ({ username: 'testuser' })),
  isAuthenticated: vi.fn(() => true),
  getAccessToken: vi.fn(() => 'mock-token')
}));

// Import commands after mocking
const { commands } = await import('../../scripts/commands.js');

// Create mock terminal
function createMockTerminal() {
  return {
    print: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    getPath: vi.fn(() => '/testuser/test-repo'),
    focus: vi.fn()
  };
}

describe('theme command integration', () => {
  let terminal;
  let githubUser;

  beforeEach(() => {
    vi.clearAllMocks();
    terminal = createMockTerminal();
    githubUser = 'testuser';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parameter handling', () => {
    it('should be called with (terminal, githubUser, args) signature', async () => {
      // This test verifies the command signature matches how commands are called
      // in app.js: commands[cmd](terminal, githubUser, args, this)
      
      const args = [];
      await commands.theme(terminal, githubUser, args);
      
      // Should not show error about unknown command
      expect(terminal.print).not.toHaveBeenCalledWith(
        expect.stringContaining('Unknown theme command')
      );
    });

    it('should show current theme when args is empty array', async () => {
      const args = [];
      await commands.theme(terminal, githubUser, args);
      
      expect(terminal.print).toHaveBeenCalledWith(
        expect.stringContaining('Current theme')
      );
    });

    it('should handle "list" subcommand correctly', async () => {
      const args = ['list'];
      await commands.theme(terminal, githubUser, args);
      
      expect(terminal.print).toHaveBeenCalledWith(
        expect.stringContaining('Available themes')
      );
    });

    it('should handle "set" subcommand with theme name', async () => {
      const args = ['set', 'light'];
      await commands.theme(terminal, githubUser, args);
      
      expect(terminal.print).toHaveBeenCalledWith(
        expect.stringContaining('Theme set to')
      );
    });

    it('should show error for unknown subcommand', async () => {
      const args = ['unknown'];
      await commands.theme(terminal, githubUser, args);
      
      expect(terminal.print).toHaveBeenCalledWith(
        expect.stringContaining('Unknown theme command: unknown')
      );
    });

    it('should not treat githubUser as first argument', async () => {
      // This is the bug we fixed: githubUser was being treated as args[0]
      // When user types "theme", args should be [], not ['awesomejerry']
      
      const args = [];
      await commands.theme(terminal, 'awesomejerry', args);
      
      // Should show current theme, not "Unknown theme command: a"
      expect(terminal.print).toHaveBeenCalledWith(
        expect.stringContaining('Current theme')
      );
      expect(terminal.print).not.toHaveBeenCalledWith(
        expect.stringContaining('Unknown theme command')
      );
    });
  });

  describe('command registration', () => {
    it('should have theme command registered', () => {
      expect(commands.theme).toBeDefined();
      expect(typeof commands.theme).toBe('function');
    });
  });
});
