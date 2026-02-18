import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    getStore: () => store
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

const { 
  getStagedChanges, 
  stageCreate, 
  stageUpdate, 
  stageDelete, 
  unstageFile, 
  clearStaging 
} = await import('../../scripts/staging.js');

describe('Staging Management', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('getStagedChanges', () => {
    it('should return empty array when no changes staged', () => {
      const changes = getStagedChanges();
      expect(changes).toEqual([]);
    });

    it('should return staged changes', () => {
      const mockChanges = [{ type: 'create', path: 'owner/repo/file.js' }];
      localStorageMock.setItem('github_os_staged_changes', JSON.stringify(mockChanges));

      const changes = getStagedChanges();

      expect(changes).toEqual(mockChanges);
    });
  });

  describe('stageCreate', () => {
    it('should stage a new file', () => {
      stageCreate('owner', 'repo', 'path/to/file.js', 'content');

      const saved = JSON.parse(localStorageMock.getStore()['github_os_staged_changes']);
      expect(saved).toHaveLength(1);
      expect(saved[0].type).toBe('create');
      expect(saved[0].path).toBe('owner/repo/path/to/file.js');
    });

    it('should update existing staged file', () => {
      stageCreate('owner', 'repo', 'file.js', 'original');
      stageCreate('owner', 'repo', 'file.js', 'updated');

      const saved = JSON.parse(localStorageMock.getStore()['github_os_staged_changes']);
      expect(saved).toHaveLength(1);
    });
  });

  describe('stageUpdate', () => {
    it('should stage a file update', () => {
      stageUpdate('owner', 'repo', 'file.js', 'content', 'sha123');

      const saved = JSON.parse(localStorageMock.getStore()['github_os_staged_changes']);
      expect(saved[0].type).toBe('update');
      expect(saved[0].sha).toBe('sha123');
    });
  });

  describe('stageDelete', () => {
    it('should stage a file deletion', () => {
      stageDelete('owner', 'repo', 'file.js', 'sha123');

      const saved = JSON.parse(localStorageMock.getStore()['github_os_staged_changes']);
      expect(saved[0].type).toBe('delete');
      expect(saved[0].sha).toBe('sha123');
    });
  });

  describe('unstageFile', () => {
    it('should remove staged file', () => {
      stageCreate('owner', 'repo', 'file.js', 'content');

      const removed = unstageFile('owner/repo/file.js');

      expect(removed).toBe(true);
      const saved = JSON.parse(localStorageMock.getStore()['github_os_staged_changes']);
      expect(saved).toHaveLength(0);
    });

    it('should return false for non-staged file', () => {
      const removed = unstageFile('nonexistent');

      expect(removed).toBe(false);
    });
  });

  describe('clearStaging', () => {
    it('should clear all staged changes', () => {
      stageCreate('owner', 'repo', 'file1.js', 'content');
      stageCreate('owner', 'repo', 'file2.js', 'content');

      const count = clearStaging();

      expect(count).toBe(2);
    });

    it('should return 0 when nothing staged', () => {
      const count = clearStaging();
      expect(count).toBe(0);
    });
  });
});
