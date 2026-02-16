import { describe, it, expect } from 'vitest';
import { validatePattern, isValidGitHubUrl, escapeHtml } from '../../scripts/utils.js';

describe('Security: validatePattern', () => {
  it('should accept valid patterns', () => {
    expect(validatePattern('test').valid).toBe(true);
    expect(validatePattern('function').valid).toBe(true);
    expect(validatePattern('export.*import').valid).toBe(true);
  });

  it('should reject patterns that are too long', () => {
    const longPattern = 'a'.repeat(101);
    const result = validatePattern(longPattern, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too long');
  });

  it('should reject empty patterns', () => {
    expect(validatePattern('').valid).toBe(false);
    expect(validatePattern(null).valid).toBe(false);
    expect(validatePattern(undefined).valid).toBe(false);
  });

  it('should reject dangerous ReDoS patterns', () => {
    // (a+)+ pattern - catastrophic backtracking
    expect(validatePattern('(a+)+').valid).toBe(false);
    
    // (a*)+ pattern
    expect(validatePattern('(a*)+').valid).toBe(false);
    
    // Large quantifiers
    expect(validatePattern('a{1000,}').valid).toBe(false);
  });

  it('should accept patterns with normal quantifiers', () => {
    expect(validatePattern('a+').valid).toBe(true);
    expect(validatePattern('a*').valid).toBe(true);
    expect(validatePattern('a{2,5}').valid).toBe(true);
  });
});

describe('Security: isValidGitHubUrl', () => {
  it('should accept valid GitHub URLs', () => {
    expect(isValidGitHubUrl('https://github.com/user/repo')).toBe(true);
    expect(isValidGitHubUrl('https://raw.githubusercontent.com/user/repo/main/file.js')).toBe(true);
    expect(isValidGitHubUrl('https://api.github.com/repos/user/repo')).toBe(true);
    expect(isValidGitHubUrl('https://codeload.github.com/user/repo/zip/main')).toBe(true);
  });

  it('should reject non-HTTPS URLs', () => {
    expect(isValidGitHubUrl('http://github.com/user/repo')).toBe(false);
    expect(isValidGitHubUrl('ftp://github.com/user/repo')).toBe(false);
  });

  it('should reject non-GitHub domains', () => {
    expect(isValidGitHubUrl('https://evil.com/malware')).toBe(false);
    expect(isValidGitHubUrl('https://github.com.evil.com/fake')).toBe(false);
  });

  it('should reject invalid URLs', () => {
    expect(isValidGitHubUrl('not a url')).toBe(false);
    expect(isValidGitHubUrl(null)).toBe(false);
    expect(isValidGitHubUrl('')).toBe(false);
  });

  it('should reject javascript: URLs', () => {
    expect(isValidGitHubUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('Security: escapeHtml', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(escapeHtml('Test & "quote"')).toBe('Test &amp; "quote"');
  });

  it('should handle empty/null input', () => {
    expect(escapeHtml('')).toBe('');
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('should not modify safe text', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
    expect(escapeHtml('path/to/file.js')).toBe('path/to/file.js');
  });
});
