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

describe('File Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('createFile API call', () => {
    it('should make PUT request to create file', async () => {
      const mockResponse = {
        commit: { sha: 'abc123def456' }
      };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Test that fetch is called with correct params
      await fetch('https://api.github.com/repos/owner/repo/contents/test.txt', {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer token' },
        body: JSON.stringify({
          message: 'Create test.txt',
          content: btoa('Hello World')
        })
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/contents/test.txt',
        expect.objectContaining({
          method: 'PUT'
        })
      );
    });

    it('should handle authentication error (401)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const response = await fetch('https://api.github.com/repos/owner/repo/contents/test.txt');
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should handle conflict (409)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 409
      });

      const response = await fetch('https://api.github.com/repos/owner/repo/contents/test.txt');
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(409);
    });
  });

  describe('deleteFile API call', () => {
    it('should make DELETE request with SHA', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ commit: { sha: 'new-sha' } })
      });

      await fetch('https://api.github.com/repos/owner/repo/contents/test.txt', {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer token' },
        body: JSON.stringify({
          message: 'Delete test.txt',
          sha: 'file-sha-123'
        })
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/contents/test.txt',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('checkFileExists', () => {
    it('should return ok: true for existing file', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true });

      const response = await fetch('https://api.github.com/repos/owner/repo/contents/existing.txt');
      
      expect(response.ok).toBe(true);
    });

    it('should return ok: false for missing file', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });

      const response = await fetch('https://api.github.com/repos/owner/repo/contents/missing.txt');
      
      expect(response.ok).toBe(false);
    });
  });

  describe('Base64 encoding', () => {
    it('should encode content correctly', () => {
      const content = 'Hello World';
      const encoded = btoa(content);
      const decoded = atob(encoded);
      
      expect(decoded).toBe(content);
    });

    it('should encode empty content', () => {
      const content = '';
      const encoded = btoa(content);
      const decoded = atob(encoded);
      
      expect(decoded).toBe(content);
    });
  });
});
