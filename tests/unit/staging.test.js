import { describe, it, expect, beforeEach, vi } from 'vitest';

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

const STORAGE_KEY = 'github_os_staging';

describe('Staging Module', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('getStagedChanges', () => {
    it('should return empty arrays when nothing is staged', async () => {
      const { getStagedChanges } = await import('../../scripts/staging.js');
      const changes = getStagedChanges();
      
      expect(changes.creates).toEqual([]);
      expect(changes.updates).toEqual([]);
      expect(changes.deletes).toEqual([]);
    });

    it('should return all staged changes', async () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({
        creates: { 'new.txt': 'content' },
        updates: { 'edit.txt': { content: 'updated', sha: 'abc123' } },
        deletes: { 'old.txt': 'def456' }
      }));

      vi.resetModules();
      const { getStagedChanges } = await import('../../scripts/staging.js');
      const changes = getStagedChanges();
      
      expect(changes.creates).toHaveLength(1);
      expect(changes.creates[0].path).toBe('new.txt');
      expect(changes.creates[0].content).toBe('content');
      
      expect(changes.updates).toHaveLength(1);
      expect(changes.updates[0].path).toBe('edit.txt');
      expect(changes.updates[0].sha).toBe('abc123');
      
      expect(changes.deletes).toHaveLength(1);
      expect(changes.deletes[0].path).toBe('old.txt');
      expect(changes.deletes[0].sha).toBe('def456');
    });
  });

  describe('stageCreate', () => {
    it('should stage a new file creation', async () => {
      const { stageCreate, getStagedChanges } = await import('../../scripts/staging.js');
      
      stageCreate('newfile.txt', 'Hello World');
      const changes = getStagedChanges();
      
      expect(changes.creates).toHaveLength(1);
      expect(changes.creates[0].path).toBe('newfile.txt');
      expect(changes.creates[0].content).toBe('Hello World');
    });

    it('should update existing staged create', async () => {
      const { stageCreate, getStagedChanges } = await import('../../scripts/staging.js');
      
      stageCreate('file.txt', 'original');
      stageCreate('file.txt', 'updated');
      
      const changes = getStagedChanges();
      expect(changes.creates).toHaveLength(1);
      expect(changes.creates[0].content).toBe('updated');
    });

    it('should remove delete when staging create for same path', async () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({
        deletes: { 'file.txt': 'abc123' }
      }));

      vi.resetModules();
      const { stageCreate, getStagedChanges } = await import('../../scripts/staging.js');
      
      stageCreate('file.txt', 'new content');
      const changes = getStagedChanges();
      
      expect(changes.deletes).toHaveLength(0);
      expect(changes.creates).toHaveLength(1);
    });
  });

  describe('stageUpdate', () => {
    it('should stage a file update', async () => {
      const { stageUpdate, getStagedChanges } = await import('../../scripts/staging.js');
      
      stageUpdate('file.txt', 'new content', 'abc123');
      const changes = getStagedChanges();
      
      expect(changes.updates).toHaveLength(1);
      expect(changes.updates[0].path).toBe('file.txt');
      expect(changes.updates[0].content).toBe('new content');
      expect(changes.updates[0].sha).toBe('abc123');
    });

    it('should update existing staged create instead of adding update', async () => {
      const { stageCreate, stageUpdate, getStagedChanges } = await import('../../scripts/staging.js');
      
      stageCreate('file.txt', 'original');
      stageUpdate('file.txt', 'modified', 'abc123');
      
      const changes = getStagedChanges();
      expect(changes.creates).toHaveLength(1);
      expect(changes.creates[0].content).toBe('modified');
      expect(changes.updates).toHaveLength(0);
    });
  });

  describe('stageDelete', () => {
    it('should stage a file deletion', async () => {
      const { stageDelete, getStagedChanges } = await import('../../scripts/staging.js');
      
      stageDelete('old.txt', 'abc123');
      const changes = getStagedChanges();
      
      expect(changes.deletes).toHaveLength(1);
      expect(changes.deletes[0].path).toBe('old.txt');
      expect(changes.deletes[0].sha).toBe('abc123');
    });

    it('should cancel staged create when deleting same path', async () => {
      const { stageCreate, stageDelete, getStagedChanges } = await import('../../scripts/staging.js');
      
      stageCreate('file.txt', 'content');
      stageDelete('file.txt', 'abc123');
      
      const changes = getStagedChanges();
      expect(changes.creates).toHaveLength(0);
      expect(changes.deletes).toHaveLength(0);
    });
  });

  describe('unstage', () => {
    it('should remove a staged file', async () => {
      const { stageCreate, unstage, getStagedChanges } = await import('../../scripts/staging.js');
      
      stageCreate('file1.txt', 'content1');
      stageCreate('file2.txt', 'content2');
      unstage('file1.txt');
      
      const changes = getStagedChanges();
      expect(changes.creates).toHaveLength(1);
      expect(changes.creates[0].path).toBe('file2.txt');
    });

    it('should not error when unstaging non-existent path', async () => {
      const { unstage, getStagedChanges } = await import('../../scripts/staging.js');
      
      expect(() => unstage('nonexistent.txt')).not.toThrow();
      const changes = getStagedChanges();
      expect(changes.creates).toHaveLength(0);
    });
  });

  describe('clearStaging', () => {
    it('should clear all staged changes', async () => {
      const { stageCreate, stageUpdate, stageDelete, clearStaging, getStagedChanges } = await import('../../scripts/staging.js');
      
      stageCreate('new.txt', 'content');
      stageUpdate('edit.txt', 'updated', 'abc');
      stageDelete('old.txt', 'def');
      
      clearStaging();
      const changes = getStagedChanges();
      
      expect(changes.creates).toHaveLength(0);
      expect(changes.updates).toHaveLength(0);
      expect(changes.deletes).toHaveLength(0);
    });
  });

  describe('hasStagedChanges', () => {
    it('should return false when nothing is staged', async () => {
      const { hasStagedChanges } = await import('../../scripts/staging.js');
      expect(hasStagedChanges()).toBe(false);
    });

    it('should return true when creates exist', async () => {
      const { stageCreate, hasStagedChanges } = await import('../../scripts/staging.js');
      stageCreate('file.txt', 'content');
      expect(hasStagedChanges()).toBe(true);
    });

    it('should return true when updates exist', async () => {
      const { stageUpdate, hasStagedChanges } = await import('../../scripts/staging.js');
      stageUpdate('file.txt', 'content', 'sha');
      expect(hasStagedChanges()).toBe(true);
    });

    it('should return true when deletes exist', async () => {
      const { stageDelete, hasStagedChanges } = await import('../../scripts/staging.js');
      stageDelete('file.txt', 'sha');
      expect(hasStagedChanges()).toBe(true);
    });
  });

  describe('persistence', () => {
    it('should persist changes across module reloads', async () => {
      const { stageCreate } = await import('../../scripts/staging.js');
      stageCreate('persistent.txt', 'saved content');
      
      vi.resetModules();
      
      const { getStagedChanges } = await import('../../scripts/staging.js');
      const changes = getStagedChanges();
      
      expect(changes.creates).toHaveLength(1);
      expect(changes.creates[0].path).toBe('persistent.txt');
    });
  });
});
