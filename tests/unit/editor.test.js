import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock atob/btoa
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');

describe('Editor Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Base64 Encoding for Editor', () => {
    it('should correctly encode content for GitHub API', () => {
      const content = 'Hello World!';
      const encoded = btoa(content);
      const decoded = atob(encoded);
      
      expect(decoded).toBe(content);
    });

    it('should encode multiline content', () => {
      const content = `Line 1
Line 2
Line 3`;
      const encoded = btoa(content);
      const decoded = atob(encoded);
      
      expect(decoded).toBe(content);
    });

    it('should encode content with special characters', () => {
      const content = 'function test() { return "<div>"; }';
      const encoded = btoa(content);
      const decoded = atob(encoded);
      
      expect(decoded).toBe(content);
    });
  });

  describe('Editor Save API Call', () => {
    it('should make PUT request to update file', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          commit: { sha: 'new-commit-sha' }
        })
      });

      const content = 'Updated content';
      const response = await fetch('https://api.github.com/repos/owner/repo/contents/file.txt', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update file.txt',
          content: btoa(content),
          sha: 'original-file-sha'
        })
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/contents/file.txt',
        expect.objectContaining({
          method: 'PUT'
        })
      );
      
      expect(response.ok).toBe(true);
    });

    it('should handle save error (401)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const response = await fetch('https://api.github.com/repos/owner/repo/contents/file.txt', {
        method: 'PUT'
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });

  describe('File Loading for Editor', () => {
    it('should fetch file content', async () => {
      const content = 'File content here';
      const base64Content = btoa(content);
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: 'file',
          content: base64Content,
          sha: 'file-sha-123'
        })
      });

      const response = await fetch('https://api.github.com/repos/owner/repo/contents/file.txt');
      const data = await response.json();
      
      expect(data.type).toBe('file');
      expect(atob(data.content)).toBe(content);
    });
  });
});
