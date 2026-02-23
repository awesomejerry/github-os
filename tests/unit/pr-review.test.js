import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

global.fetch = vi.fn();

vi.mock('../../scripts/session.js', () => ({
  loadSession: vi.fn(() => ({ username: 'testuser', accessToken: 'mock-token' })),
  isAuthenticated: vi.fn(() => true),
  getAccessToken: vi.fn(() => 'mock-token')
}));

const { fetchPRFiles, createReview, fetchPRComments, addPRComment, clearCache } = 
  await import('../../scripts/github.js');

describe('PR Review Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
    clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchPRFiles', () => {
    it('should fetch PR files successfully', async () => {
      const mockFiles = [
        { filename: 'src/app.js', status: 'modified', additions: 10, deletions: 5, changes: 15, blob_url: 'url1' },
        { filename: 'src/utils.js', status: 'added', additions: 20, deletions: 0, changes: 20, blob_url: 'url2' }
      ];
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFiles
      });

      const files = await fetchPRFiles('owner', 'repo', 42);
      
      expect(files).toHaveLength(2);
      expect(files[0].filename).toBe('src/app.js');
      expect(files[0].status).toBe('modified');
      expect(files[0].additions).toBe(10);
      expect(files[1].status).toBe('added');
    });

    it('should handle PR not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(fetchPRFiles('owner', 'repo', 999)).rejects.toThrow('not found');
    });

    it('should handle API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(fetchPRFiles('owner', 'repo', 42)).rejects.toThrow('Failed to fetch PR files');
    });
  });

  describe('createReview', () => {
    it('should create approving review', async () => {
      const mockReview = {
        id: 123,
        state: 'APPROVED',
        body: 'Looks good!',
        html_url: 'https://github.com/owner/repo/pull/42#pullrequestreview-123'
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReview
      });

      const result = await createReview('owner', 'repo', 42, 'APPROVE', 'Looks good!');
      
      expect(result.id).toBe(123);
      expect(result.state).toBe('APPROVED');
      expect(result.body).toBe('Looks good!');
    });

    it('should create review requesting changes', async () => {
      const mockReview = {
        id: 124,
        state: 'CHANGES_REQUESTED',
        body: 'Please fix the bug',
        html_url: 'https://github.com/owner/repo/pull/42#pullrequestreview-124'
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReview
      });

      const result = await createReview('owner', 'repo', 42, 'REQUEST_CHANGES', 'Please fix the bug');
      
      expect(result.state).toBe('CHANGES_REQUESTED');
    });

    it('should create comment-only review', async () => {
      const mockReview = {
        id: 125,
        state: 'COMMENTED',
        body: 'Just a comment',
        html_url: 'https://github.com/owner/repo/pull/42#pullrequestreview-125'
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReview
      });

      const result = await createReview('owner', 'repo', 42, 'COMMENT', 'Just a comment');
      
      expect(result.state).toBe('COMMENTED');
    });

    it('should handle authentication error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(createReview('owner', 'repo', 42, 'APPROVE', 'text'))
        .rejects.toThrow('Authentication required');
    });

    it('should handle permission denied', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      await expect(createReview('owner', 'repo', 42, 'APPROVE', 'text'))
        .rejects.toThrow('Permission denied');
    });

    it('should handle PR not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(createReview('owner', 'repo', 999, 'APPROVE', 'text'))
        .rejects.toThrow('not found');
    });

    it('should handle validation errors (422)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ message: 'Review already submitted' })
      });

      await expect(createReview('owner', 'repo', 42, 'APPROVE', 'text'))
        .rejects.toThrow('Review already submitted');
    });
  });

  describe('fetchPRComments', () => {
    it('should fetch both review and issue comments', async () => {
      const mockReviewComments = [
        { 
          id: 1, 
          user: { login: 'reviewer1' }, 
          body: 'Code looks good', 
          path: 'src/app.js',
          created_at: '2024-01-01T10:00:00Z',
          html_url: 'url1'
        }
      ];
      
      const mockIssueComments = [
        { 
          id: 2, 
          user: { login: 'commenter1' }, 
          body: 'General comment', 
          created_at: '2024-01-01T11:00:00Z',
          html_url: 'url2'
        }
      ];
      
      fetch.mockResolvedValueOnce({ ok: true, json: async () => mockReviewComments });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => mockIssueComments });

      const comments = await fetchPRComments('owner', 'repo', 42);
      
      expect(comments).toHaveLength(2);
      expect(comments[0].type).toBe('review');
      expect(comments[0].path).toBe('src/app.js');
      expect(comments[1].type).toBe('issue');
    });

    it('should return empty array when no comments', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      const comments = await fetchPRComments('owner', 'repo', 42);
      
      expect(comments).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

      await expect(fetchPRComments('owner', 'repo', 42)).rejects.toThrow('Failed to fetch PR comments');
    });
  });

  describe('addPRComment', () => {
    it('should add comment to PR successfully', async () => {
      const mockComment = {
        id: 123,
        body: 'Nice work!',
        user: { login: 'testuser' },
        created_at: '2024-01-01T12:00:00Z',
        html_url: 'https://github.com/owner/repo/issues/42#issuecomment-123'
      };
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockComment
      });

      const result = await addPRComment('owner', 'repo', 42, 'Nice work!');
      
      expect(result.id).toBe(123);
      expect(result.body).toBe('Nice work!');
      expect(result.user).toBe('testuser');
    });

    it('should handle authentication error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(addPRComment('owner', 'repo', 42, 'text'))
        .rejects.toThrow('Authentication required');
    });

    it('should handle permission denied', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      await expect(addPRComment('owner', 'repo', 42, 'text'))
        .rejects.toThrow('Permission denied');
    });

    it('should handle PR not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(addPRComment('owner', 'repo', 999, 'text'))
        .rejects.toThrow('not found');
    });
  });
});
