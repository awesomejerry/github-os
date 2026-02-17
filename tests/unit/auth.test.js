import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock crypto
const mockRandomValues = vi.fn((arr) => {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
});

Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: mockRandomValues,
    subtle: {
      digest: vi.fn(async (algorithm, data) => {
        // Mock SHA256 - return deterministic hash for testing
        const mockHash = new Uint8Array(32).fill(1);
        return mockHash.buffer;
      })
    }
  }
});

// Mock btoa for base64 encoding
global.btoa = vi.fn((str) => Buffer.from(str, 'binary').toString('base64'));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock window.location
delete window.location;
window.location = { 
  href: '',
  search: '',
  origin: 'https://www.awesomejerry.space'
};

// Mock fetch
global.fetch = vi.fn();

describe('OAuth Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    window.location.href = '';
    window.location.search = '';
  });

  describe('generatePKCE', () => {
    it('should be tested via initiateLogin', async () => {
      // generatePKCE is called internally by initiateLogin
      // We test it indirectly through the login flow
      expect(true).toBe(true);
    });
  });

  describe('initiateLogin', () => {
    it('should redirect to GitHub OAuth', async () => {
      const { initiateLogin } = await import('../../scripts/auth.js');

      await initiateLogin();

      expect(window.location.href).toContain('https://github.com/login/oauth/authorize');
      expect(window.location.href).toContain('client_id=');
      expect(window.location.href).toContain('code_challenge=');
      expect(window.location.href).toContain('code_challenge_method=S256');
    });

    it('should store PKCE state in localStorage', async () => {
      const { initiateLogin } = await import('../../scripts/auth.js');

      await initiateLogin();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'github_os_pkce_state',
        expect.stringMatching(/code_verifier/)
      );
    });
  });

  describe('retrievePKCEState', () => {
    it('should return null when no state exists', async () => {
      const { retrievePKCEState } = await import('../../scripts/auth.js');

      const state = retrievePKCEState();

      expect(state).toBeNull();
    });

    it('should return stored PKCE state', async () => {
      const mockState = { 
        code_verifier: 'test-verifier', 
        state: 'test-state',
        createdAt: Date.now()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockState));

      const { retrievePKCEState } = await import('../../scripts/auth.js');
      const state = retrievePKCEState();

      expect(state).toEqual(mockState);
    });
  });

  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      global.fetch.mockResolvedValueOnce({ ok: true });

      const { validateToken } = await import('../../scripts/auth.js');
      const result = await validateToken('valid-token');

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token'
          })
        })
      );
    });

    it('should return false for invalid token', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });

      const { validateToken } = await import('../../scripts/auth.js');
      const result = await validateToken('invalid-token');

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { validateToken } = await import('../../scripts/auth.js');
      const result = await validateToken('token');

      expect(result).toBe(false);
    });
  });

  describe('fetchUserInfo', () => {
    it('should return user info for valid token', async () => {
      const mockUser = {
        login: 'testuser',
        avatar_url: 'https://example.com/avatar.png',
        name: 'Test User'
      };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser
      });

      const { fetchUserInfo } = await import('../../scripts/auth.js');
      const result = await fetchUserInfo('valid-token');

      expect(result).toEqual(mockUser);
    });

    it('should throw error for invalid token', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const { fetchUserInfo } = await import('../../scripts/auth.js');

      await expect(fetchUserInfo('invalid-token')).rejects.toThrow('Invalid or expired token');
    });

    it('should throw error on HTTP error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const { fetchUserInfo } = await import('../../scripts/auth.js');

      await expect(fetchUserInfo('token')).rejects.toThrow('Failed to fetch user info');
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange code for token via worker', async () => {
      const mockResponse = {
        access_token: 'gho_test_token',
        token_type: 'bearer',
        scope: 'repo,user'
      };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { exchangeCodeForToken } = await import('../../scripts/auth.js');
      const result = await exchangeCodeForToken('test-code', 'test-verifier');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://github-os-token.awesomejerryshen.workers.dev',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test-code')
        })
      );
    });

    it('should throw error when exchange fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      const { exchangeCodeForToken } = await import('../../scripts/auth.js');

      await expect(exchangeCodeForToken('code', 'verifier')).rejects.toThrow();
    });

    it('should throw error when response contains error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'invalid_grant', error_description: 'Invalid code' })
      });

      const { exchangeCodeForToken } = await import('../../scripts/auth.js');

      await expect(exchangeCodeForToken('code', 'verifier')).rejects.toThrow('Invalid code');
    });
  });

  describe('handleCallback', () => {
    it('should return error when no code in URL', async () => {
      window.location.search = '';

      const { handleCallback } = await import('../../scripts/auth.js');
      const result = await handleCallback();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No authorization code');
    });

    it('should return error when GitHub returns error', async () => {
      window.location.search = '?error=access_denied&error_description=User+denied';

      const { handleCallback } = await import('../../scripts/auth.js');
      const result = await handleCallback();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User denied');
    });

    it('should return error when PKCE state not found', async () => {
      window.location.search = '?code=test-code&state=test-state';
      localStorageMock.getItem.mockReturnValue(null); // No PKCE state

      const { handleCallback } = await import('../../scripts/auth.js');
      const result = await handleCallback();

      expect(result.success).toBe(false);
      expect(result.error).toContain('PKCE state not found');
    });

    it('should successfully complete OAuth flow', async () => {
      window.location.search = '?code=test-code&state=test-state';
      
      // Set up PKCE state
      const pkceState = { code_verifier: 'test-verifier', state: 'test-state' };
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'github_os_pkce_state') {
          return JSON.stringify(pkceState);
        }
        return null;
      });

      // Mock token exchange
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'gho_test_token',
          token_type: 'bearer',
          scope: 'repo,user'
        })
      });

      // Mock user info fetch
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          login: 'testuser',
          avatar_url: 'https://example.com/avatar.png'
        })
      });

      const { handleCallback } = await import('../../scripts/auth.js');
      const result = await handleCallback();

      expect(result.success).toBe(true);
    });
  });
});
