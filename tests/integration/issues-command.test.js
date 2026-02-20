// Integration tests for Issues Command

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

vi.mock('../../scripts/session.js', () => ({
  loadSession: vi.fn(() => ({ username: 'testuser', accessToken: 'mock-token' })),
  isAuthenticated: vi.fn(() => true),
  getAccessToken: vi.fn(() => 'mock-token')
}));

function createMockTerminal(path = '/github-os') {
  const outputs = [];
  let inputCallback = null;
  
  return {
    outputs,
    path,
    print: vi.fn((text) => outputs.push(text)),
    getPath: vi.fn(() => path),
    setPath: vi.fn(function(newPath) { this.path = newPath; }),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    clear: vi.fn(),
    setInput: vi.fn(),
    waitForInput: vi.fn((callback) => {
      inputCallback = callback;
    }),
    simulateInput: (input) => {
      if (inputCallback) {
        inputCallback(input);
        inputCallback = null;
      }
    },
    getCurrentBranch: vi.fn(() => null),
    setCurrentBranch: vi.fn()
  };
}

describe('Issues Command', () => {
  let mockTerminal;
  let session;

  beforeAll(async () => {
    session = await import('../../scripts/session.js');
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    
    mockTerminal = createMockTerminal('/test-repo');
    
    session.isAuthenticated.mockReturnValue(true);
    session.getAccessToken.mockReturnValue('mock-token');
    
    global.fetch = vi.fn();
  });

  describe('Command signature', () => {
    it('should accept (terminal, githubUser, args) signature', async () => {
      const { commands } = await import('../../scripts/commands.js');
      
      expect(typeof commands.issues).toBe('function');
      expect(commands.issues.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('issues (list)', () => {
    it('should list open issues by default', async () => {
      const mockIssues = [
        {
          number: 1,
          title: 'Bug in login',
          user: { login: 'user1' },
          labels: [{ name: 'bug' }],
          created_at: '2024-01-01T00:00:00Z',
          state: 'open',
          html_url: 'https://github.com/owner/repo/issues/1'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIssues,
        headers: { get: vi.fn(() => null) }
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', []);

      expect(mockTerminal.showLoading).toHaveBeenCalled();
      expect(mockTerminal.hideLoading).toHaveBeenCalled();
      expect(mockTerminal.print).toHaveBeenCalled();
    });

    it('should show error when not in a repository', async () => {
      const rootTerminal = createMockTerminal('/');
      const { commands } = await import('../../scripts/commands.js');
      
      await commands.issues(rootTerminal, 'testuser', []);
      
      const calls = rootTerminal.print.mock.calls;
      const hasError = calls.some(call => 
        call[0] && call[0].includes('Not in a repository')
      );
      expect(hasError).toBe(true);
    });
  });

  describe('issues view', () => {
    it('should show issue details', async () => {
      const mockIssue = {
        number: 42,
        title: 'Test Issue',
        body: 'Issue description',
        state: 'open',
        user: { login: 'author' },
        labels: [{ name: 'bug' }],
        created_at: '2024-01-01T00:00:00Z',
        html_url: 'https://github.com/owner/repo/issues/42',
        comments: 3
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIssue
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['view', '42']);

      expect(mockTerminal.showLoading).toHaveBeenCalled();
      expect(mockTerminal.hideLoading).toHaveBeenCalled();
    });

    it('should show usage without number', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['view']);

      const calls = mockTerminal.print.mock.calls;
      const hasUsage = calls.some(call => 
        call[0] && call[0].includes('Usage')
      );
      expect(hasUsage).toBe(true);
    });

    it('should handle invalid issue number', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['view', 'abc']);

      const calls = mockTerminal.print.mock.calls;
      const hasError = calls.some(call => 
        call[0] && call[0].includes('Invalid issue number')
      );
      expect(hasError).toBe(true);
    });
  });

  describe('issues create', () => {
    it('should require authentication', async () => {
      session.isAuthenticated.mockReturnValue(false);
      
      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['create']);

      const calls = mockTerminal.print.mock.calls;
      const hasAuthError = calls.some(call => 
        call[0] && call[0].includes('Authentication required')
      );
      expect(hasAuthError).toBe(true);
    });

    it('should create issue with flags', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          number: 43,
          title: 'New Issue',
          html_url: 'https://github.com/owner/repo/issues/43',
          state: 'open'
        })
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['create', '-t', 'New Issue', '-b', 'Description']);

      expect(mockTerminal.showLoading).toHaveBeenCalled();
    });
  });

  describe('issues close', () => {
    it('should require authentication', async () => {
      session.isAuthenticated.mockReturnValue(false);
      
      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['close', '42']);

      const calls = mockTerminal.print.mock.calls;
      const hasAuthError = calls.some(call => 
        call[0] && call[0].includes('Authentication required')
      );
      expect(hasAuthError).toBe(true);
    });

    it('should show confirmation prompt', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['close', '42']);

      expect(mockTerminal.waitForInput).toHaveBeenCalled();
      
      const calls = mockTerminal.print.mock.calls;
      const hasConfirm = calls.some(call => 
        call[0] && call[0].includes('Type')
      );
      expect(hasConfirm).toBe(true);
    });

    it('should show usage without number', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['close']);

      const calls = mockTerminal.print.mock.calls;
      const hasUsage = calls.some(call => 
        call[0] && call[0].includes('Usage')
      );
      expect(hasUsage).toBe(true);
    });
  });

  describe('issues reopen', () => {
    it('should require authentication', async () => {
      session.isAuthenticated.mockReturnValue(false);
      
      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['reopen', '42']);

      const calls = mockTerminal.print.mock.calls;
      const hasAuthError = calls.some(call => 
        call[0] && call[0].includes('Authentication required')
      );
      expect(hasAuthError).toBe(true);
    });

    it('should show confirmation prompt', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['reopen', '42']);

      expect(mockTerminal.waitForInput).toHaveBeenCalled();
    });
  });

  describe('issues comment', () => {
    it('should require authentication', async () => {
      session.isAuthenticated.mockReturnValue(false);
      
      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['comment', '42', 'text']);

      const calls = mockTerminal.print.mock.calls;
      const hasAuthError = calls.some(call => 
        call[0] && call[0].includes('Authentication required')
      );
      expect(hasAuthError).toBe(true);
    });

    it('should show usage without arguments', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['comment', '42']);

      const calls = mockTerminal.print.mock.calls;
      const hasUsage = calls.some(call => 
        call[0] && call[0].includes('Usage')
      );
      expect(hasUsage).toBe(true);
    });

    it('should add comment with valid parameters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 123,
          html_url: 'https://github.com/owner/repo/issues/42#issuecomment-123'
        })
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['comment', '42', 'Great', 'work!']);

      expect(mockTerminal.showLoading).toHaveBeenCalled();
    });
  });

  describe('unknown subcommand', () => {
    it('should show error for unknown subcommand', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.issues(mockTerminal, 'testuser', ['unknown']);

      const calls = mockTerminal.print.mock.calls;
      const hasError = calls.some(call => 
        call[0] && call[0].includes('Unknown issues command')
      );
      expect(hasError).toBe(true);
    });
  });
});
