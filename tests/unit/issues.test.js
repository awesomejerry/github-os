// Unit tests for Issue Operations

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

global.fetch = vi.fn();

vi.mock('../../scripts/auth.js', () => ({
  isAuthenticated: vi.fn(() => true),
  getAccessToken: vi.fn(() => 'mock-token')
}));

vi.mock('../../scripts/session.js', () => ({
  loadSession: vi.fn(() => ({ username: 'testuser', accessToken: 'mock-token' })),
  isAuthenticated: vi.fn(() => true),
  getAccessToken: vi.fn(() => 'mock-token')
}));

const { fetchIssue, createIssue, updateIssue, addIssueComment, clearCache } = 
  await import('../../scripts/github.js');

describe('Issue Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
    clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchIssue', () => {
    it('should fetch single issue details', async () => {
      const mockIssue = {
        number: 42,
        title: 'Test Issue',
        body: 'Issue description',
        state: 'open',
        user: { login: 'author' },
        labels: [{ name: 'bug' }, { name: 'high-priority' }],
        created_at: '2024-01-01T00:00:00Z',
        html_url: 'https://github.com/owner/repo/issues/42',
        comments: 5
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIssue
      });

      const issue = await fetchIssue('owner', 'repo', 42);
      
      expect(issue.number).toBe(42);
      expect(issue.title).toBe('Test Issue');
      expect(issue.body).toBe('Issue description');
      expect(issue.state).toBe('open');
      expect(issue.author).toBe('author');
      expect(issue.labels).toEqual(['bug', 'high-priority']);
      expect(issue.comments).toBe(5);
    });

    it('should handle issue not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(fetchIssue('owner', 'repo', 999)).rejects.toThrow('Issue not found');
    });

    it('should reject pull requests', async () => {
      const mockPR = {
        number: 42,
        title: 'Test PR',
        state: 'open',
        user: { login: 'author' },
        pull_request: { url: 'https://api.github.com/repos/owner/repo/pulls/42' },
        labels: [],
        created_at: '2024-01-01T00:00:00Z',
        html_url: 'https://github.com/owner/repo/pull/42'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPR
      });

      await expect(fetchIssue('owner', 'repo', 42)).rejects.toThrow('Not an issue');
    });

    it('should handle empty body', async () => {
      const mockIssue = {
        number: 42,
        title: 'Test Issue',
        body: null,
        state: 'open',
        user: { login: 'author' },
        labels: [],
        created_at: '2024-01-01T00:00:00Z',
        html_url: 'https://github.com/owner/repo/issues/42',
        comments: 0
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockIssue
      });

      const issue = await fetchIssue('owner', 'repo', 42);
      expect(issue.body).toBe('');
    });
  });

  describe('createIssue', () => {
    it('should create issue with valid parameters', async () => {
      const mockCreatedIssue = {
        number: 43,
        title: 'New Bug',
        html_url: 'https://github.com/owner/repo/issues/43',
        state: 'open'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreatedIssue
      });

      const result = await createIssue('owner', 'repo', 'New Bug', 'Bug description');
      
      expect(result.number).toBe(43);
      expect(result.title).toBe('New Bug');
      expect(result.html_url).toBe('https://github.com/owner/repo/issues/43');
    });

    it('should send POST request with correct body', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          number: 1,
          title: 'Test',
          html_url: 'url',
          state: 'open'
        })
      });

      await createIssue('owner', 'repo', 'Test Title', 'Test Body');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/issues',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'Test Title', body: 'Test Body' })
        })
      );
    });

    it('should handle authentication error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(createIssue('owner', 'repo', 'Title', 'Body'))
        .rejects.toThrow('Authentication required');
    });

    it('should handle permission denied', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      await expect(createIssue('owner', 'repo', 'Title', 'Body'))
        .rejects.toThrow('Permission denied');
    });

    it('should handle validation errors (422)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ message: 'Validation failed: title is required' })
      });

      await expect(createIssue('owner', 'repo', 'Title', 'Body'))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('updateIssue', () => {
    it('should close issue successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          number: 42,
          title: 'Test Issue',
          state: 'closed',
          html_url: 'https://github.com/owner/repo/issues/42'
        })
      });

      const result = await updateIssue('owner', 'repo', 42, 'closed');
      
      expect(result.state).toBe('closed');
    });

    it('should reopen issue successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          number: 42,
          title: 'Test Issue',
          state: 'open',
          html_url: 'https://github.com/owner/repo/issues/42'
        })
      });

      const result = await updateIssue('owner', 'repo', 42, 'open');
      
      expect(result.state).toBe('open');
    });

    it('should send PATCH request with correct body', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          number: 1,
          title: 'Test',
          state: 'closed',
          html_url: 'url'
        })
      });

      await updateIssue('owner', 'repo', 1, 'closed');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/issues/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ state: 'closed' })
        })
      );
    });

    it('should handle authentication error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(updateIssue('owner', 'repo', 42, 'closed'))
        .rejects.toThrow('Authentication required');
    });

    it('should handle permission denied', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      await expect(updateIssue('owner', 'repo', 42, 'closed'))
        .rejects.toThrow('Permission denied');
    });

    it('should handle issue not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(updateIssue('owner', 'repo', 999, 'closed'))
        .rejects.toThrow('not found');
    });
  });

  describe('addIssueComment', () => {
    it('should add comment successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 12345,
          html_url: 'https://github.com/owner/repo/issues/42#issuecomment-12345'
        })
      });

      const result = await addIssueComment('owner', 'repo', 42, 'Great work!');
      
      expect(result.id).toBe(12345);
      expect(result.html_url).toContain('issuecomment-12345');
    });

    it('should send POST request with correct body', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          html_url: 'url'
        })
      });

      await addIssueComment('owner', 'repo', 42, 'Comment text');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/issues/42/comments',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ body: 'Comment text' })
        })
      );
    });

    it('should handle authentication error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(addIssueComment('owner', 'repo', 42, 'Comment'))
        .rejects.toThrow('Authentication required');
    });

    it('should handle permission denied', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      await expect(addIssueComment('owner', 'repo', 42, 'Comment'))
        .rejects.toThrow('Permission denied');
    });

    it('should handle issue not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(addIssueComment('owner', 'repo', 999, 'Comment'))
        .rejects.toThrow('not found');
    });
  });
});
