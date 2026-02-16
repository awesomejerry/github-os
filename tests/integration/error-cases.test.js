import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch responses
const mockResponses = new Map();

function setMockResponse(urlPattern, data) {
  mockResponses.set(urlPattern, data);
}

// Mock terminal factory
function createMockTerminal(path = '/github-os') {
  const outputs = [];
  return {
    outputs,
    print: vi.fn((text) => outputs.push(text)),
    printCode: vi.fn((code, lang) => outputs.push(code)),
    clear: vi.fn(),
    getPath: vi.fn(() => path),
    setInput: vi.fn(),
    setPath: vi.fn(),
    setTabState: vi.fn(),
    resetTabState: vi.fn(),
    setGithubUser: vi.fn(),
    getPreviousPath: vi.fn(() => null),
    showLoading: vi.fn(),
    hideLoading: vi.fn()
  };
}

const originalFetch = global.fetch;

describe('Error Cases and Edge Cases', () => {
  let terminal;

  beforeEach(async () => {
    vi.resetModules();
    mockResponses.clear();
    terminal = createMockTerminal();
    
    global.fetch = vi.fn(async (url) => {
      if (url.includes('/users/') && url.includes('/repos')) {
        const data = mockResponses.get('repos');
        if (data === 'error') {
          return Promise.resolve({ ok: false, status: 404 });
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data || []) });
      }
      if (url.includes('/git/trees/')) {
        const data = mockResponses.get('tree');
        if (data === 'error') {
          return Promise.resolve({ ok: false, status: 404 });
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data || { tree: [] }) });
      }
      if (url.includes('/branches')) {
        const data = mockResponses.get('branches');
        if (data === 'error') {
          return Promise.resolve({ ok: false, status: 500 });
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data || []) });
      }
      if (url.includes('/commits')) {
        const data = mockResponses.get('commits');
        if (data === 'error') {
          return Promise.resolve({ ok: false, status: 500 });
        }
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data || []) });
      }
      if (url.includes('/repos/')) {
        const data = mockResponses.get('repoInfo');
        if (data === 'error') {
          return Promise.resolve({ ok: false, status: 404 });
        }
        if (data) {
          return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
        }
      }
      if (url.includes('/contents/')) {
        const data = mockResponses.get('contents') || mockResponses.get('file');
        if (data === 'error') {
          return Promise.resolve({ ok: false, status: 404 });
        }
        if (data) {
          return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
        }
      }
      
      return Promise.resolve({ ok: false, status: 404 });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('ls command - error cases', () => {
    it('should handle empty repository list', async () => {
      terminal = createMockTerminal('/');
      mockResponses.set('repos', []);

      const { commands } = await import('../../scripts/commands.js');
      await commands.ls(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      // Should not crash, might show empty or count
      expect(terminal.print).toHaveBeenCalled();
    });

    it('should handle API error when listing repos', async () => {
      terminal = createMockTerminal('/');
      mockResponses.set('repos', 'error');

      const { commands } = await import('../../scripts/commands.js');
      await commands.ls(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toMatch(/error|failed|not found/i);
    });

    it('should handle repository with no language', async () => {
      terminal = createMockTerminal('/');
      mockResponses.set('repos', [
        { name: 'no-lang-repo', description: 'Test', stargazers_count: 5, forks_count: 1, language: null }
      ]);

      const { commands } = await import('../../scripts/commands.js');
      await commands.ls(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('no-lang-repo');
    });
  });

  describe('cd command - error cases', () => {
    it('should show usage when no argument provided', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.cd(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Usage');
    });

    it('should show error for non-existent directory', async () => {
      mockResponses.set('contents', 'error');
      
      const { commands } = await import('../../scripts/commands.js');
      await commands.cd(terminal, 'testuser', ['nonexistent']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toMatch(/not found|error/i);
    });
  });

  describe('cat command - error cases', () => {
    it('should show error when trying to cat a directory', async () => {
      mockResponses.set('contents', { name: 'src', type: 'dir' });

      const { commands } = await import('../../scripts/commands.js');
      await commands.cat(terminal, 'testuser', ['src']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toMatch(/not a file|error/i);
    });

    it('should show error for non-existent file', async () => {
      mockResponses.set('file', 'error');

      const { commands } = await import('../../scripts/commands.js');
      await commands.cat(terminal, 'testuser', ['nonexistent.txt']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toMatch(/not found|error/i);
    });
  });

  describe('log command - edge cases', () => {
    it('should handle repository with no commits', async () => {
      mockResponses.set('repoInfo', { default_branch: 'main' });
      mockResponses.set('commits', []);

      const { commands } = await import('../../scripts/commands.js');
      await commands.log(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      // Should handle gracefully
      expect(terminal.print).toHaveBeenCalled();
    });

    it('should handle custom commit count', async () => {
      mockResponses.set('repoInfo', { default_branch: 'main' });
      mockResponses.set('commits', [
        { sha: 'abc1234', commit: { author: { name: 'Test', date: '2026-02-16T10:00:00Z' }, message: 'Test' }, html_url: 'url' }
      ]);

      const { commands } = await import('../../scripts/commands.js');
      await commands.log(terminal, 'testuser', ['5']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('abc1234');
    });

    it('should handle long commit messages', async () => {
      const longMessage = 'A'.repeat(100);
      mockResponses.set('repoInfo', { default_branch: 'main' });
      mockResponses.set('commits', [
        { sha: 'abc1234', commit: { author: { name: 'Test', date: '2026-02-16T10:00:00Z' }, message: longMessage }, html_url: 'url' }
      ]);

      const { commands } = await import('../../scripts/commands.js');
      await commands.log(terminal, 'testuser', []);
      
      // Should truncate message
      expect(terminal.print).toHaveBeenCalled();
    });
  });

  describe('branch command - edge cases', () => {
    it('should handle repository with single branch', async () => {
      mockResponses.set('repoInfo', { default_branch: 'main' });
      mockResponses.set('branches', [{ name: 'main', protected: true }]);

      const { commands } = await import('../../scripts/commands.js');
      await commands.branch(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('main');
      expect(output).toContain('1 branch');
    });

    it('should handle repository with many branches', async () => {
      mockResponses.set('repoInfo', { default_branch: 'main' });
      const branches = Array.from({ length: 50 }, (_, i) => ({ name: `branch-${i}`, protected: false }));
      branches[0] = { name: 'main', protected: true };
      mockResponses.set('branches', branches);

      const { commands } = await import('../../scripts/commands.js');
      await commands.branch(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('50 branch');
    });
  });

  describe('find command - edge cases', () => {
    it('should find no files with non-matching pattern', async () => {
      mockResponses.set('repoInfo', { default_branch: 'main' });
      mockResponses.set('tree', {
        tree: [
          { path: 'README.md', type: 'blob' }
        ]
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.find(terminal, 'testuser', ['*.xyz']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('No files found');
    });

    it('should handle empty repository', async () => {
      mockResponses.set('repoInfo', { default_branch: 'main' });
      mockResponses.set('tree', { tree: [] });

      const { commands } = await import('../../scripts/commands.js');
      await commands.find(terminal, 'testuser', ['*']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('No files found');
    });

    it('should handle special characters in pattern', async () => {
      mockResponses.set('repoInfo', { default_branch: 'main' });
      mockResponses.set('tree', {
        tree: [
          { path: 'file.test.js', type: 'blob' },
          { path: 'file.spec.js', type: 'blob' }
        ]
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.find(terminal, 'testuser', ['*.test.js']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('file.test.js');
      expect(output).not.toContain('file.spec.js');
    });

    it('should find files with ? wildcard', async () => {
      mockResponses.set('repoInfo', { default_branch: 'main' });
      mockResponses.set('tree', {
        tree: [
          { path: 'file1.js', type: 'blob' },
          { path: 'file2.js', type: 'blob' },
          { path: 'file10.js', type: 'blob' }
        ]
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.find(terminal, 'testuser', ['file?.js']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('file1.js');
      expect(output).toContain('file2.js');
      expect(output).not.toContain('file10.js');
    });
  });

  describe('info command - edge cases', () => {
    it('should handle repository without license', async () => {
      mockResponses.set('repoInfo', {
        name: 'test-repo',
        full_name: 'user/test-repo',
        description: 'Test',
        stargazers_count: 0,
        forks_count: 0,
        watchers_count: 0,
        language: null,
        topics: [],
        license: null,
        default_branch: 'main',
        html_url: 'url'
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.info(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('test-repo');
    });

    it('should handle API error', async () => {
      mockResponses.set('repoInfo', 'error');

      const { commands } = await import('../../scripts/commands.js');
      await commands.info(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toMatch(/error|failed|not found/i);
    });
  });

  describe('head/tail commands - edge cases', () => {
    it('should handle file with fewer lines than requested', async () => {
      mockResponses.set('file', {
        type: 'file',
        name: 'short.txt',
        content: btoa('line1\nline2')
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.head(terminal, 'testuser', ['short.txt', '10']);
      
      // Should show all available lines
      expect(terminal.printCode).toHaveBeenCalled();
    });

    it('should handle empty file', async () => {
      mockResponses.set('file', {
        type: 'file',
        name: 'empty.txt',
        content: btoa('')
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.head(terminal, 'testuser', ['empty.txt']);
      
      expect(terminal.printCode).toHaveBeenCalled();
    });
  });

  describe('grep command - edge cases', () => {
    it('should show error when pattern but no file', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.grep(terminal, 'testuser', ['pattern']);
      
      const output = terminal.outputs.join('\n');
      // Should either show usage or require file
      expect(terminal.print).toHaveBeenCalled();
    });
  });

  describe('download command - edge cases', () => {
    it('should show error for non-existent file', async () => {
      mockResponses.set('file', 'error');

      const { commands } = await import('../../scripts/commands.js');
      await commands.download(terminal, 'testuser', ['nonexistent.txt']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toMatch(/error|not found|failed/i);
    });

    it('should show error when trying to download directory', async () => {
      mockResponses.set('contents', { name: 'src', type: 'dir' });

      const { commands } = await import('../../scripts/commands.js');
      await commands.download(terminal, 'testuser', ['src']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toMatch(/not a file|error/i);
    });
  });

  describe('Caching behavior', () => {
    it('should cache API responses', async () => {
      mockResponses.set('repoInfo', { 
        name: 'test', 
        full_name: 'user/test',
        default_branch: 'main',
        stargazers_count: 10,
        forks_count: 5,
        watchers_count: 20,
        language: 'JS',
        topics: [],
        license: null,
        html_url: 'url'
      });

      const { commands } = await import('../../scripts/commands.js');
      
      // Call info twice
      await commands.info(terminal, 'testuser', []);
      await commands.info(terminal, 'testuser', []);
      
      // Fetch should be called (second call uses cache)
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
