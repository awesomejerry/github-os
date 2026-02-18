import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();

describe('Git Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('getDefaultBranchSHA', () => {
    it('should get SHA of default branch', async () => {
      // Mock getRepoInfo
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ default_branch: 'main' })
      });
      
      // Mock get ref
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          object: { sha: 'abc123default' }
        })
      });

      const { getDefaultBranchSHA } = await import('../../scripts/github.js');
      
      const result = await getDefaultBranchSHA('owner', 'repo');
      
      expect(result).toBe('abc123default');
    });
  });

  describe('createBranch', () => {
    it('should create a new branch', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const { createBranch } = await import('../../scripts/github.js');
      
      const result = await createBranch('owner', 'repo', 'feature-test', 'abc123');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/git/refs',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('refs/heads/feature-test')
        })
      );
      
      expect(result).toBe(true);
    });

    it('should handle branch already exists error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 422
      });

      const { createBranch } = await import('../../scripts/github.js');
      
      await expect(createBranch('owner', 'repo', 'existing-branch', 'abc'))
        .rejects.toThrow('already exists');
    });

    it('should handle authentication error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const { createBranch } = await import('../../scripts/github.js');
      
      await expect(createBranch('owner', 'repo', 'branch', 'abc'))
        .rejects.toThrow('Authentication required');
    });

    it('should handle permission denied', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      const { createBranch } = await import('../../scripts/github.js');
      
      await expect(createBranch('owner', 'repo', 'branch', 'abc'))
        .rejects.toThrow('Permission denied');
    });
  });

  describe('deleteBranch', () => {
    it('should delete a branch', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true
      });

      const { deleteBranch } = await import('../../scripts/github.js');
      
      const result = await deleteBranch('owner', 'repo', 'old-feature');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/git/refs/heads/old-feature',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
      
      expect(result).toBe(true);
    });

    it('should handle branch not found', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const { deleteBranch } = await import('../../scripts/github.js');
      
      await expect(deleteBranch('owner', 'repo', 'missing-branch'))
        .rejects.toThrow('not found');
    });

    it('should handle protected branch deletion', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403
      });

      const { deleteBranch } = await import('../../scripts/github.js');
      
      await expect(deleteBranch('owner', 'repo', 'main'))
        .rejects.toThrow('Permission denied or branch is protected');
    });
  });

  describe('clearBranchCache', () => {
    it('should clear branch-related cache entries', async () => {
      const { clearBranchCache, clearCache } = await import('../../scripts/github.js');
      
      // Should not throw
      expect(() => clearBranchCache('owner', 'repo')).not.toThrow();
    });
  });

  describe('Branch Name Validation', () => {
    it('should accept valid branch names', () => {
      const validNames = [
        'main',
        'feature-123',
        'fix/issue-456',
        'release_v2.0',
        'hotfix.urgent'
      ];
      
      const branchNameRegex = /^[a-zA-Z0-9._/-]+$/;
      
      validNames.forEach(name => {
        expect(branchNameRegex.test(name)).toBe(true);
      });
    });

    it('should reject invalid branch names', () => {
      const invalidNames = [
        'branch with space',
        'branch@special',
        'branch#hash',
        'branch$dollar'
      ];
      
      const branchNameRegex = /^[a-zA-Z0-9._/-]+$/;
      
      invalidNames.forEach(name => {
        expect(branchNameRegex.test(name)).toBe(false);
      });
    });
  });
});
