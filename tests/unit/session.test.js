import { describe, it, expect, beforeEach, vi } from 'vitest';

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

// Import after mocking
const { 
  saveSession, 
  loadSession, 
  loadAllSessions, 
  clearSession, 
  clearAllSessions,
  switchAccount,
  isAuthenticated,
  getAccessToken 
} = await import('../../scripts/session.js');

describe('Session Management', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('saveSession', () => {
    it('should save session to localStorage', () => {
      const sessionData = {
        username: 'testuser',
        accessToken: 'test-token',
        tokenType: 'bearer',
        scope: 'repo,user',
        createdAt: Date.now(),
        isActive: true
      };

      const result = saveSession(sessionData);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'github_os_session',
        expect.stringContaining('testuser')
      );
    });

    it('should set isActive to true for new session', () => {
      const sessionData = {
        username: 'testuser',
        accessToken: 'test-token',
        isActive: false
      };

      saveSession(sessionData);

      const saved = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(saved.isActive).toBe(true);
    });
  });

  describe('loadSession', () => {
    it('should return null when no session exists', () => {
      const session = loadSession();
      expect(session).toBeNull();
    });

    it('should return session when it exists', () => {
      const sessionData = {
        username: 'testuser',
        accessToken: 'test-token',
        isActive: true
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData));

      const session = loadSession();

      expect(session).toEqual(sessionData);
    });

    it('should return null on JSON parse error', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const session = loadSession();

      expect(session).toBeNull();
    });
  });

  describe('loadAllSessions', () => {
    it('should return empty array when no sessions exist', () => {
      const sessions = loadAllSessions();
      expect(sessions).toEqual([]);
    });

    it('should return all sessions', () => {
      const sessions = [
        { username: 'user1', isActive: true },
        { username: 'user2', isActive: false }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessions));

      const result = loadAllSessions();

      expect(result).toHaveLength(2);
    });
  });

  describe('clearSession', () => {
    it('should remove current session', () => {
      const sessionData = { username: 'testuser', accessToken: 'token' };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(sessionData));
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([sessionData]));

      const result = clearSession();

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('github_os_session');
    });

    it('should return true when no session exists', () => {
      const result = clearSession();
      expect(result).toBe(true);
    });
  });

  describe('clearAllSessions', () => {
    it('should remove all sessions from localStorage', () => {
      const result = clearAllSessions();

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('github_os_session');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('github_os_sessions');
    });
  });

  describe('switchAccount', () => {
    it('should switch to existing account', () => {
      const sessions = [
        { username: 'user1', isActive: true },
        { username: 'user2', isActive: false }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessions));

      const result = switchAccount('user2');

      expect(result).toBe(true);
    });

    it('should return false for non-existing account', () => {
      const sessions = [
        { username: 'user1', isActive: true }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessions));

      const result = switchAccount('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no session exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true when valid session exists', () => {
      const sessionData = { username: 'testuser', accessToken: 'token' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData));

      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when session has no accessToken', () => {
      const sessionData = { username: 'testuser' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData));

      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('getAccessToken', () => {
    it('should return null when no session exists', () => {
      expect(getAccessToken()).toBeNull();
    });

    it('should return access token from session', () => {
      const sessionData = { username: 'testuser', accessToken: 'my-token' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessionData));

      expect(getAccessToken()).toBe('my-token');
    });
  });
});
