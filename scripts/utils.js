// GitHub OS - Utility Functions

/**
 * Escape HTML characters to prevent XSS
 */
export function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validate and sanitize search pattern to prevent ReDoS attacks
 * @param {string} pattern - User input pattern
 * @param {number} maxLength - Maximum allowed length (default 100)
 * @returns {object} - { valid: boolean, error?: string, sanitized?: string }
 */
export function validatePattern(pattern, maxLength = 100) {
  if (!pattern || typeof pattern !== 'string') {
    return { valid: false, error: 'Pattern is required' };
  }
  
  if (pattern.length > maxLength) {
    return { valid: false, error: `Pattern too long (max ${maxLength} characters)` };
  }
  
  // Check for potentially dangerous regex patterns (ReDoS)
  // Patterns with repeated quantifiers like (a+)+ or (a*)+
  const dangerousPatterns = [
    /\(\s*[^)]*[+*]\s*\)\s*[+*]/,  // (a+)+ or (a*)+
    /\[\s*[^\]]*[+*]\s*\]\s*[+*]/, // [a+]+
    /\\[+*][+*]/,                   // \++ or \**
    /[{,]\d{3,}/                    // {100,} - large quantifiers
  ];
  
  for (const dangerous of dangerousPatterns) {
    if (dangerous.test(pattern)) {
      return { valid: false, error: 'Pattern contains potentially dangerous regex' };
    }
  }
  
  return { valid: true, sanitized: pattern };
}

/**
 * Validate URL is from allowed GitHub domains
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is safe
 */
export function isValidGitHubUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const parsed = new URL(url);
    
    // Must be HTTPS
    if (parsed.protocol !== 'https:') {
      return false;
    }
    
    // Must be GitHub domains
    const allowedHosts = [
      'github.com',
      'www.github.com',
      'raw.githubusercontent.com',
      'gist.githubusercontent.com',
      'codeload.github.com',
      'api.github.com'
    ];
    
    return allowedHosts.some(host => parsed.hostname === host || parsed.hostname.endsWith('.' + host));
  } catch {
    return false;
  }
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

export function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diffYears > 0) {
    return rtf.format(-diffYears, 'year');
  } else if (diffMonths > 0) {
    return rtf.format(-diffMonths, 'month');
  } else if (diffWeeks > 0) {
    return rtf.format(-diffWeeks, 'week');
  } else if (diffDays > 0) {
    return rtf.format(-diffDays, 'day');
  } else if (diffHours > 0) {
    return rtf.format(-diffHours, 'hour');
  } else if (diffMinutes > 0) {
    return rtf.format(-diffMinutes, 'minute');
  } else {
    return 'just now';
  }
}
