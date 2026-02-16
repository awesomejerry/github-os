import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  formatBytes, 
  getFileExtension, 
  getLanguageForFile,
  formatRelativeDate 
} from '../../scripts/utils.js';

describe('formatBytes', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(100)).toBe('100 B');
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes correctly', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(2.5 * 1024 * 1024)).toBe('2.5 MB');
    expect(formatBytes(10 * 1024 * 1024)).toBe('10.0 MB');
  });
});

describe('getFileExtension', () => {
  it('extracts simple extensions', () => {
    expect(getFileExtension('file.js')).toBe('js');
    expect(getFileExtension('index.html')).toBe('html');
    expect(getFileExtension('styles.css')).toBe('css');
  });

  it('handles files with multiple dots', () => {
    expect(getFileExtension('index.test.js')).toBe('js');
    expect(getFileExtension('app.min.css')).toBe('css');
    expect(getFileExtension('file.name.with.dots.md')).toBe('md');
  });

  it('handles files without extension', () => {
    expect(getFileExtension('README')).toBe('readme');
    expect(getFileExtension('Makefile')).toBe('makefile');
  });

  it('returns lowercase extension', () => {
    expect(getFileExtension('File.JS')).toBe('js');
    expect(getFileExtension('File.HTML')).toBe('html');
  });
});

describe('getLanguageForFile', () => {
  const languageMap = {
    'js': 'javascript',
    'ts': 'typescript',
    'html': 'html',
    'css': 'css',
    'py': 'python',
    'md': 'markdown'
  };

  it('returns correct language for known extensions', () => {
    expect(getLanguageForFile('app.js', languageMap)).toBe('javascript');
    expect(getLanguageForFile('main.ts', languageMap)).toBe('typescript');
    expect(getLanguageForFile('index.html', languageMap)).toBe('html');
    expect(getLanguageForFile('README.md', languageMap)).toBe('markdown');
  });

  it('returns plaintext for unknown extensions', () => {
    expect(getLanguageForFile('unknown.xyz', languageMap)).toBe('plaintext');
    expect(getLanguageForFile('data.json', languageMap)).toBe('plaintext');
  });
});

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-16T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats "just now" for recent dates', () => {
    const date = new Date('2026-02-16T11:59:30Z'); // 30 seconds ago
    expect(formatRelativeDate(date.toISOString())).toBe('just now');
  });

  it('formats hours ago', () => {
    const date = new Date('2026-02-16T10:00:00Z');
    expect(formatRelativeDate(date.toISOString())).toBe('2 hours ago');
  });

  it('formats days ago', () => {
    const date = new Date('2026-02-14T12:00:00Z');
    expect(formatRelativeDate(date.toISOString())).toBe('2 days ago');
  });

  it('formats weeks ago', () => {
    const date = new Date('2026-02-02T12:00:00Z');
    expect(formatRelativeDate(date.toISOString())).toBe('2 weeks ago');
  });
});
