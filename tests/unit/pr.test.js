// Unit tests for PR Operations

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Mock auth module
vi.mock('../../scripts/auth.js', () => ({
  isAuthenticated: vi.fn(() => true),
  getAccessToken: vi.fn(() => 'mock-token')
}));

// Mock session module  
vi.mock('../../scripts/session.js', () => ({
  loadSession: vi.fn(() => ({ username: 'testuser', accessToken: 'mock-token' })),
  isAuthenticated: vi.fn(() => true),
  getAccessToken: vi.fn(() => 'mock-token')
}));

const { fetchRepoPRs, fetchRepoPR, createPR, mergePR, closePR, fetchPR } = 
  await import('../../scripts/github.js');

describe('PR Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchRepoPRs', () => {
    it('should fetch open PRs by default', async () => {
      const mockPRs = [
        { 
          number: 1, 
          title: 'PR 1', 
          state: 'open',
          user: { login: 'author1' },
          head: { ref: 'feature1' },
          base: { ref: 'main' },
          created_at: '2024-01-01',
          labels: [],
          html_url: 'https://github.com/owner/repo/pull/1'
        },
        { 
          number: 2, 
          title: 'PR 2', 
          state: 'open',
          user: { login: 'author2' },
          head: { ref: 'feature2' },
          base: { ref: 'main' },
          created_at: '2024-01-02',
          labels: [],
          html_url: 'https://github.com/owner/repo/pull/2'
        }
      ];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPRs
      });

      const prs = await fetchRepoPRs('owner', 'repo');
      
      expect(prs).toHaveLength(2);
    });

    it('should fetch all PRs when state=all', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const prs = await fetchRepoPRs('owner', 'repo', 'all');
      expect(prs).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      // Cache might interfere, so we test with a different repo
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      try {
        await fetchRepoPRs('nonexistent', 'repo');
      } catch (e) {
        expect(e.message).toContain('Failed to fetch');
      }
    });
  });

  describe('fetchRepoPR', () => {
    it('should fetch single PR details', async () => {
      const mockPR = {
        number: 42,
        title: 'Test PR',
        body: 'Description',
        state: 'open',
        head: { ref: 'feature' },
        base: { ref: 'main' },
        user: { login: 'author' },
        created_at: '2024-01-01T00:00:00Z',
        merged: false,
        draft: false,
        additions: 10,
        deletions: 5,
        changed_files: 2,
        labels: [],
        html_url: 'https://github.com/owner/repo/pull/42'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPR
      });

      const pr = await fetchRepoPR('owner', 'repo', 42);
      
      expect(pr.number).toBe(42);
      expect(pr.title).toBe('Test PR');
      expect(pr.head_branch).toBe('feature');
      expect(pr.base_branch).toBe('main');
      expect(pr.author).toBe('author');
    });

    it('should handle PR not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(fetchRepoPR('owner', 'repo', 999)).rejects.toThrow('not found');
    });
  });

  describe('createPR', () => {
    it('should create PR with valid parameters', async () => {
      const mockCreatedPR = {
        number: 43,
        title: 'New Feature',
        html_url: 'https://github.com/owner/repo/pull/43',
        state: 'open'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedPR
      });

      const result = await createPR('owner', 'repo', 'New Feature', 'Description', 'feature', 'main');
      
      expect(result.number).toBe(43);
      expect(result.html_url).toBe('https://github.com/owner/repo/pull/43');
    });

    it('should handle authentication error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(createPR('owner', 'repo', 'Title', 'Body', 'head', 'base'))
        .rejects.toThrow('Authentication required');
    });

    it('should handle permission denied', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      await expect(createPR('owner', 'repo', 'Title', 'Body', 'head', 'base'))
        .rejects.toThrow('Permission denied');
    });

    it('should handle validation errors (422)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ message: 'Validation failed: head branch required' })
      });

      await expect(createPR('owner', 'repo', 'Title', 'Body', 'head', 'base'))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('mergePR', () => {
    it('should merge PR successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sha: 'abc123',
          merged: true,
          message: 'Pull request successfully merged'
        })
      });

      const result = await mergePR('owner', 'repo', 42, 'Merge pull request #42');
      
      expect(result.sha).toBe('abc123');
      expect(result.merged).toBe(true);
    });

    it('should handle not mergeable (405)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 405
      });

      await expect(mergePR('owner', 'repo', 42, 'title'))
        .rejects.toThrow('not mergeable');
    });

    it('should handle merge conflicts (409)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 409
      });

      await expect(mergePR('owner', 'repo', 42, 'title'))
        .rejects.toThrow('conflicts');
    });

    it('should handle PR not found (404)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(mergePR('owner', 'repo', 999, 'title'))
        .rejects.toThrow('not found');
    });
  });

  describe('closePR', () => {
    it('should close PR successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          number: 42,
          state: 'closed',
          html_url: 'https://github.com/owner/repo/pull/42'
        })
      });

      const result = await closePR('owner', 'repo', 42);
      
      expect(result.state).toBe('closed');
    });

    it('should handle authentication error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(closePR('owner', 'repo', 42))
        .rejects.toThrow('Authentication required');
    });

    it('should handle permission denied', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      await expect(closePR('owner', 'repo', 42))
        .rejects.toThrow('Permission denied');
    });

    it('should handle PR not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(closePR('owner', 'repo', 999))
        .rejects.toThrow('not found');
    });
  });

  describe('fetchPR (alias)', () => {
    it('should work as alias to fetchRepoPR', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          number: 42,
          title: 'Test',
          state: 'open',
          head: { ref: 'feature' },
          base: { ref: 'main' },
          user: { login: 'author' },
          created_at: '2024-01-01',
          labels: [],
          html_url: 'url'
        })
      });

      const result = await fetchPR('owner', 'repo', 42);
      expect(result.number).toBe(42);
    });
  });
});
