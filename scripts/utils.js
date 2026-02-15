// GitHub OS - Utility Functions

/**
 * Escape HTML characters to prevent XSS
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Get file extension
 */
export function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

/**
 * Get language for syntax highlighting based on file extension
 */
export function getLanguageForFile(filename, languageMap) {
  const ext = getFileExtension(filename);
  return languageMap[ext] || 'plaintext';
}

/**
 * Auto-detect GitHub username from GitHub Pages URL
 */
export function detectGitHubUser(defaultUser) {
  const hostname = window.location.hostname;
  // Match *.github.io pattern
  const match = hostname.match(/^([^.]+)\.github\.io$/);
  if (match) {
    return match[1];
  }
  return defaultUser;
}
