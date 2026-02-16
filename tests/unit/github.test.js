import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to mock fetch before importing the module
const mockResponses = new Map();

function setMockResponse(urlPattern, data) {
  mockResponses.set(urlPattern, data);
}

// Mock global fetch
const originalFetch = global.fetch;

describe('GitHub API Functions', () => {
  beforeEach(() => {
    vi.resetModules();
    mockResponses.clear();
    
    global.fetch = vi.fn(async (url) => {
      for (const [pattern, data] of mockResponses) {
        if (url.includes(pattern)) {
          if (data instanceof Error) {
            return Promise.resolve({ ok: false, status: 404 });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(data)
          });
        }
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('fetchUserRepos', () => {
    it('should fetch and format user repositories', async () => {
      const mockRepos = [
        { name: 'repo1', description: 'Test repo', stargazers_count: 10, forks_count: 2, language: 'JavaScript' },
        { name: 'repo2', description: 'Another repo', stargazers_count: 5, forks_count: 1, language: 'TypeScript' }
      ];
      setMockResponse('/users/', mockRepos);

      const { fetchUserRepos, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const repos = await fetchUserRepos('testuser');
      
      expect(repos).toHaveLength(2);
      expect(repos[0].name).toBe('repo1');
      expect(repos[0].type).toBe('dir');
      expect(repos[0].stars).toBe(10);
      expect(repos[1].language).toBe('TypeScript');
    });

    it('should cache repository results', async () => {
      setMockResponse('/users/', []);
      
      const { fetchUserRepos, clearCache, getCache } = await import('../../scripts/github.js');
      clearCache();
      
      await fetchUserRepos('testuser');
      await fetchUserRepos('testuser');
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRepoInfo', () => {
    it('should fetch and format repository info', async () => {
      const mockRepoInfo = {
        name: 'test-repo',
        full_name: 'user/test-repo',
        description: 'A test repository',
        stargazers_count: 100,
        forks_count: 20,
        watchers_count: 50,
        language: 'JavaScript',
        topics: ['test', 'demo'],
        license: { spdx_id: 'MIT' },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        homepage: 'https://example.com',
        html_url: 'https://github.com/user/test-repo',
        default_branch: 'main'
      };
      setMockResponse('/repos/user/test-repo', mockRepoInfo);

      const { getRepoInfo, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const info = await getRepoInfo('user', 'test-repo');
      
      expect(info.name).toBe('test-repo');
      expect(info.stars).toBe(100);
      expect(info.default_branch).toBe('main');
      expect(info.topics).toEqual(['test', 'demo']);
      expect(info.license).toBe('MIT');
    });
  });

  describe('fetchRepoCommits', () => {
    it('should fetch and format commits', async () => {
      const mockCommits = [
        { 
          sha: 'abc1234567890def1234567890',
          commit: { 
            author: { name: 'Jerry', date: '2026-02-16T10:00:00Z' },
            message: 'Add feature\n\nDetailed description'
          },
          html_url: 'https://github.com/user/repo/commit/abc'
        }
      ];
      setMockResponse('/commits', mockCommits);

      const { fetchRepoCommits, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const commits = await fetchRepoCommits('user', 'repo', 10);
      
      expect(commits).toHaveLength(1);
      expect(commits[0].sha).toBe('abc1234'); // First 7 chars
      expect(commits[0].author).toBe('Jerry');
      expect(commits[0].message).toBe('Add feature'); // First line only
    });

    it('should return empty array for empty repository (409)', async () => {
      global.fetch = vi.fn(async () => ({ ok: false, status: 409 }));

      const { fetchRepoCommits, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const commits = await fetchRepoCommits('user', 'empty-repo', 10);
      expect(commits).toEqual([]);
    });
  });

  describe('fetchRepoBranches', () => {
    it('should fetch and format branches', async () => {
      const mockBranches = [
        { name: 'main', protected: true },
        { name: 'develop', protected: false }
      ];
      setMockResponse('/branches', mockBranches);

      const { fetchRepoBranches, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const branches = await fetchRepoBranches('user', 'repo');
      
      expect(branches).toHaveLength(2);
      expect(branches[0].name).toBe('main');
      expect(branches[0].protected).toBe(true);
      expect(branches[1].name).toBe('develop');
      expect(branches[1].protected).toBe(false);
    });
  });

  describe('fetchRepoTree', () => {
    it('should fetch and filter files from tree', async () => {
      const mockTree = {
        tree: [
          { path: 'README.md', type: 'blob' },
          { path: 'src', type: 'tree' },
          { path: 'src/app.js', type: 'blob' },
          { path: 'src/utils.js', type: 'blob' }
        ]
      };
      setMockResponse('/git/trees/', mockTree);

      const { fetchRepoTree, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const files = await fetchRepoTree('user', 'repo', 'main');
      
      // Should only include files (type: blob), not directories
      expect(files).toHaveLength(3);
      expect(files.find(f => f.path === 'README.md')).toBeDefined();
      expect(files.find(f => f.path === 'src/app.js')).toBeDefined();
      expect(files.find(f => f.path === 'src')).toBeUndefined();
    });
  });

  describe('clearUserCache', () => {
    it('should clear cache for specific user', async () => {
      setMockResponse('/users/', []);
      setMockResponse('/repos/', { default_branch: 'main' });

      const { fetchUserRepos, getRepoInfo, clearUserCache, getCache, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      // Populate cache
      await fetchUserRepos('user1');
      await fetchUserRepos('user2');
      await getRepoInfo('user1', 'repo');
      
      const cache = getCache();
      const keysBefore = Array.from(cache.keys());
      expect(keysBefore.length).toBeGreaterThan(0);
      
      // Clear user1 cache
      clearUserCache('user1');
      
      const keysAfter = Array.from(cache.keys());
      // user2 cache should remain
      expect(keysAfter.some(k => k.includes('user2'))).toBe(true);
      // user1 cache should be gone
      expect(keysAfter.some(k => k.includes('user1'))).toBe(false);
    });
  });

  describe('fetchRepoIssues', () => {
    it('should fetch and format issues', async () => {
      const mockIssues = [
        {
          number: 1,
          title: 'Bug in login',
          user: { login: 'alice' },
          labels: [{ name: 'bug' }, { name: 'high' }],
          created_at: '2026-02-16T10:00:00Z',
          state: 'open',
          html_url: 'https://github.com/user/repo/issues/1'
        },
        {
          number: 2,
          title: 'Feature request',
          user: { login: 'bob' },
          labels: [{ name: 'enhancement' }],
          created_at: '2026-02-15T10:00:00Z',
          state: 'open',
          html_url: 'https://github.com/user/repo/issues/2'
        }
      ];
      setMockResponse('/issues', mockIssues);

      const { fetchRepoIssues, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const issues = await fetchRepoIssues('user', 'repo', 'open');
      
      expect(issues).toHaveLength(2);
      expect(issues[0].number).toBe(1);
      expect(issues[0].title).toBe('Bug in login');
      expect(issues[0].author).toBe('alice');
      expect(issues[0].labels).toEqual(['bug', 'high']);
      expect(issues[0].state).toBe('open');
    });

    it('should filter out pull requests', async () => {
      const mockIssues = [
        {
          number: 1,
          title: 'Real issue',
          user: { login: 'alice' },
          labels: [],
          created_at: '2026-02-16T10:00:00Z',
          state: 'open',
          html_url: 'https://github.com/user/repo/issues/1'
        },
        {
          number: 2,
          title: 'Pull request',
          user: { login: 'bob' },
          labels: [],
          created_at: '2026-02-15T10:00:00Z',
          state: 'open',
          pull_request: { url: 'https://api.github.com/repos/user/repo/pulls/2' },
          html_url: 'https://github.com/user/repo/pull/2'
        }
      ];
      setMockResponse('/issues', mockIssues);

      const { fetchRepoIssues, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const issues = await fetchRepoIssues('user', 'repo', 'open');
      
      expect(issues).toHaveLength(1);
      expect(issues[0].number).toBe(1);
      expect(issues[0].title).toBe('Real issue');
    });

    it('should cache issues results', async () => {
      setMockResponse('/issues', []);
      
      const { fetchRepoIssues, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      await fetchRepoIssues('user', 'repo', 'open');
      await fetchRepoIssues('user', 'repo', 'open');
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return empty array for no issues', async () => {
      setMockResponse('/issues', []);

      const { fetchRepoIssues, clearCache } = await import('../../scripts/github.js');
      clearCache();
      
      const issues = await fetchRepoIssues('user', 'repo', 'open');
      expect(issues).toEqual([]);
    });
  });
});
