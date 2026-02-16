import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('find command', () => {
  describe('pattern matching', () => {
    // Test the regex pattern conversion logic
    function patternToRegex(pattern) {
      const regexPattern = pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      return new RegExp(regexPattern, 'i');
    }

    it('matches wildcard patterns', () => {
      const regex = patternToRegex('*.js');
      expect('app.js').toMatch(regex);
      expect('scripts/app.js').toMatch(regex);
      expect('test.js').toMatch(regex);
      expect('app.ts').not.toMatch(regex);
    });

    it('matches single character wildcards', () => {
      const regex = patternToRegex('file?.txt');
      expect('file1.txt').toMatch(regex);
      expect('fileA.txt').toMatch(regex);
      expect('file.txt').not.toMatch(regex);
      expect('file12.txt').not.toMatch(regex);
    });

    it('matches literal text', () => {
      const regex = patternToRegex('test');
      expect('test.js').toMatch(regex);
      expect('my-test-file.js').toMatch(regex);
      expect('testing.js').toMatch(regex);
      expect('spec.js').not.toMatch(regex);
    });

    it('is case-insensitive', () => {
      const regex = patternToRegex('README');
      expect('README.md').toMatch(regex);
      expect('readme.md').toMatch(regex);
      expect('Readme.md').toMatch(regex);
    });

    it('escapes special regex characters', () => {
      const regex = patternToRegex('file.name');
      expect('file.name').toMatch(regex);
      expect('fileXname').not.toMatch(regex);
    });
  });

  describe('command registration', () => {
    it('should have find command in commands object', async () => {
      const { commands } = await import('../../scripts/commands.js');
      expect(commands).toHaveProperty('find');
      expect(typeof commands.find).toBe('function');
    });
  });
});
