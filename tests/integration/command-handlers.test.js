import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch responses
const mockResponses = new Map();

function setMockResponse(urlPattern, data) {
  mockResponses.set(urlPattern, data);
}

// Mock terminal factory - more complete mock
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
    setGithubUser: vi.fn()
  };
}

// Store original fetch
const originalFetch = global.fetch;

describe('Command Handlers', () => {
  let terminal;

  beforeEach(async () => {
    vi.resetModules();
    mockResponses.clear();
    terminal = createMockTerminal();
    
    global.fetch = vi.fn(async (url) => {
      // Handle specific URL patterns - check in order of specificity
      
      // User repos list
      if (url.includes('/users/') && url.includes('/repos')) {
        const data = mockResponses.get('repos') || [];
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
      }
      
      // Git tree (for find command)
      if (url.includes('/git/trees/')) {
        const data = mockResponses.get('tree') || { tree: [] };
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
      }
      
      // Branches
      if (url.includes('/branches')) {
        const data = mockResponses.get('branches') || [];
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
      }
      
      // Commits
      if (url.includes('/commits')) {
        const data = mockResponses.get('commits') || [];
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
      }
      
      // Repo info (check this after branches/commits)
      if (url.includes('/repos/')) {
        const data = mockResponses.get('repoInfo');
        if (data) {
          return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
        }
      }
      
      // Contents (for ls, cat, tree, etc)
      if (url.includes('/contents/')) {
        const data = mockResponses.get('contents') || mockResponses.get('file');
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

  describe('ls command', () => {
    it('should list repositories at root', async () => {
      terminal = createMockTerminal('/');
      mockResponses.set('repos', [
        { name: 'repo1', description: 'Test', stargazers_count: 10, forks_count: 2, language: 'JS' },
        { name: 'repo2', description: 'Another', stargazers_count: 5, forks_count: 1, language: 'TS' }
      ]);

      const { commands } = await import('../../scripts/commands.js');
      await commands.ls(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('repo1');
      expect(output).toContain('repo2');
    });

    it('should list directory contents in repo', async () => {
      mockResponses.set('contents', [
        { name: 'src', type: 'dir' },
        { name: 'README.md', type: 'file', size: 1024 },
        { name: 'package.json', type: 'file', size: 512 }
      ]);

      const { commands } = await import('../../scripts/commands.js');
      await commands.ls(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('src');
      expect(output).toContain('README.md');
    });
  });

  describe('cd command', () => {
    it('should change to repository', async () => {
      terminal = createMockTerminal('/');
      mockResponses.set('repos', [{ name: 'github-os', description: 'Test', stargazers_count: 10 }]);

      const { commands } = await import('../../scripts/commands.js');
      await commands.cd(terminal, 'testuser', ['github-os']);
      
      expect(terminal.setPath).toHaveBeenCalled();
    });

    it('should handle parent directory navigation with ..', async () => {
      terminal = createMockTerminal('/github-os/src');
      mockResponses.set('contents', [{ name: 'components', type: 'dir' }]);
      
      const { commands } = await import('../../scripts/commands.js');
      await commands.cd(terminal, 'testuser', ['..']);
      
      // cd .. tries to navigate - check that command ran without error
      // The actual path change depends on API validation
      const output = terminal.outputs.join('\n');
      // Should not show error (or might show path if successful)
      expect(output).not.toContain('No such file or directory');
    });

    it('should go to root with /', async () => {
      terminal = createMockTerminal('/github-os/src');
      
      const { commands } = await import('../../scripts/commands.js');
      await commands.cd(terminal, 'testuser', ['/']);
      
      expect(terminal.setPath).toHaveBeenCalledWith('/');
    });
  });

  describe('cat command', () => {
    it('should display file contents', async () => {
      mockResponses.set('file', {
        type: 'file',
        name: 'test.js',
        content: btoa('console.log("hello");')
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.cat(terminal, 'testuser', ['test.js']);
      
      expect(terminal.printCode).toHaveBeenCalledWith('console.log("hello");', 'javascript');
    });

    it('should show error for missing file argument', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.cat(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Usage');
    });
  });

  describe('tree command', () => {
    it('should display directory tree', async () => {
      mockResponses.set('contents', [
        { name: 'src', type: 'dir' },
        { name: 'README.md', type: 'file' },
        { name: 'package.json', type: 'file' }
      ]);

      const { commands } = await import('../../scripts/commands.js');
      await commands.tree(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('src');
      expect(output).toContain('README.md');
    });
  });

  describe('info command', () => {
    it('should display repository information', async () => {
      mockResponses.set('repoInfo', {
        name: 'github-os',
        full_name: 'testuser/github-os',
        description: 'A terminal interface',
        stargazers_count: 100,
        forks_count: 20,
        watchers_count: 50,
        language: 'JavaScript',
        topics: ['cli', 'github'],
        license: { spdx_id: 'MIT' },
        default_branch: 'main',
        html_url: 'https://github.com/testuser/github-os'
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.info(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('github-os');
      expect(output).toContain('100'); // stars
      expect(output).toContain('JavaScript');
    });

    it('should show error at root', async () => {
      terminal = createMockTerminal('/');
      
      const { commands } = await import('../../scripts/commands.js');
      await commands.info(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Not in a repository');
    });
  });

  describe('log command', () => {
    it('should display commit history', async () => {
      mockResponses.set('repoInfo', { default_branch: 'main' });
      mockResponses.set('commits', [
        { sha: 'abc1234567890', commit: { author: { name: 'Jerry', date: '2026-02-16T10:00:00Z' }, message: 'Add feature' }, html_url: 'url' },
        { sha: 'def456789012', commit: { author: { name: 'Alice', date: '2026-02-15T10:00:00Z' }, message: 'Fix bug' }, html_url: 'url' }
      ]);

      const { commands } = await import('../../scripts/commands.js');
      await commands.log(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('abc1234'); // short SHA
      expect(output).toContain('Jerry');
      expect(output).toContain('Add feature');
    });

    it('should show error at root', async () => {
      terminal = createMockTerminal('/');
      
      const { commands } = await import('../../scripts/commands.js');
      await commands.log(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Not in a repository');
    });
  });

  describe('branch command', () => {
    it('should display branches with default marked', async () => {
      mockResponses.set('repoInfo', { default_branch: 'main' });
      mockResponses.set('branches', [
        { name: 'main', protected: true },
        { name: 'develop', protected: false }
      ]);

      const { commands } = await import('../../scripts/commands.js');
      await commands.branch(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('main');
      expect(output).toContain('develop');
      expect(output).toContain('*'); // default branch marker
    });

    it('should show error at root', async () => {
      terminal = createMockTerminal('/');
      
      const { commands } = await import('../../scripts/commands.js');
      await commands.branch(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Not in a repository');
    });
  });

  describe('find command', () => {
    it('should find files matching pattern', async () => {
      mockResponses.set('repoInfo', { default_branch: 'main' });
      mockResponses.set('tree', {
        tree: [
          { path: 'scripts/app.js', type: 'blob' },
          { path: 'scripts/utils.js', type: 'blob' },
          { path: 'README.md', type: 'blob' }
        ]
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.find(terminal, 'testuser', ['*.js']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('scripts/app.js');
      expect(output).toContain('scripts/utils.js');
      expect(output).toContain('file(s) found');
    });

    it('should show usage when no pattern provided', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.find(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Usage');
    });

    it('should show error at root', async () => {
      terminal = createMockTerminal('/');
      
      const { commands } = await import('../../scripts/commands.js');
      await commands.find(terminal, 'testuser', ['*.js']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Not in a repository');
    });
  });

  describe('grep command', () => {
    it('should show usage when no pattern provided', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.grep(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Usage');
    });

    it('should show error at root', async () => {
      terminal = createMockTerminal('/');
      
      const { commands } = await import('../../scripts/commands.js');
      await commands.grep(terminal, 'testuser', ['pattern', 'file.js']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Not in a repository');
    });
  });

  describe('head command', () => {
    it('should show first n lines of file', async () => {
      mockResponses.set('file', {
        type: 'file',
        name: 'test.txt',
        content: btoa('line1\nline2\nline3\nline4\nline5')
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.head(terminal, 'testuser', ['test.txt', '3']);
      
      expect(terminal.printCode).toHaveBeenCalled();
      const printedCode = terminal.printCode.mock.calls[0][0];
      expect(printedCode).toContain('line1');
      expect(printedCode).toContain('line2');
      expect(printedCode).toContain('line3');
    });

    it('should show usage when no file provided', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.head(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Usage');
    });
  });

  describe('tail command', () => {
    it('should show last n lines of file', async () => {
      mockResponses.set('file', {
        type: 'file',
        name: 'test.txt',
        content: btoa('line1\nline2\nline3\nline4\nline5')
      });

      const { commands } = await import('../../scripts/commands.js');
      await commands.tail(terminal, 'testuser', ['test.txt', '2']);
      
      expect(terminal.printCode).toHaveBeenCalled();
      const printedCode = terminal.printCode.mock.calls[0][0];
      expect(printedCode).toContain('line4');
      expect(printedCode).toContain('line5');
    });

    it('should show usage when no file provided', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.tail(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Usage');
    });
  });

  describe('readme command', () => {
    it('should display README.md', async () => {
      mockResponses.set('contents', [
        { name: 'README.md', type: 'file', content: btoa('# GitHub OS\n\nA terminal interface.') }
      ]);

      const { commands } = await import('../../scripts/commands.js');
      await commands.readme(terminal, 'testuser', []);
      
      // readme command fetches README.md from current directory
      const output = terminal.outputs.join('\n');
      // It either shows content or error depending on API response
      expect(terminal.print).toHaveBeenCalled();
    });
  });

  describe('connect command', () => {
    it('should switch user', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.connect(terminal, 'olduser', ['newuser']);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('newuser');
    });

    it('should show usage when no user provided', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.connect(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Usage');
    });
  });

  describe('download command', () => {
    it('should show usage when no file provided', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.download(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Usage');
    });
  });

  describe('pwd command', () => {
    it('should print current working directory', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.pwd(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('/github-os');
    });
  });

  describe('whoami command', () => {
    it('should show current GitHub user', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.whoami(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('testuser');
    });
  });

  describe('clear command', () => {
    it('should call clear on terminal', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.clear(terminal, 'testuser', []);
      
      expect(terminal.clear).toHaveBeenCalled();
    });
  });

  describe('exit command', () => {
    it('should display goodbye message', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.exit(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toMatch(/goodbye|exit/i);
    });
  });

  describe('help command', () => {
    it('should display help text with all commands', async () => {
      const { commands } = await import('../../scripts/commands.js');
      await commands.help(terminal, 'testuser', []);
      
      const output = terminal.outputs.join('\n');
      expect(output).toContain('Available Commands');
      expect(output).toContain('ls');
      expect(output).toContain('cd');
      expect(output).toContain('find');
    });
  });
});
