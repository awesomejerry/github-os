## Why

User input is used directly in regex patterns, download URLs, and API calls without validation. This creates security vulnerabilities:
- ReDoS attacks via malicious regex patterns
- Potential MITM attacks via unvalidated URLs
- Poor UX when rate limited without notification

## What Changes

- Add input validation for grep patterns
- Add URL validation for downloads
- Add rate limit detection and user notification
- Add consistent HTML escaping for user content

## Capabilities

### Modified Capabilities

- `commands`: Add error scenarios for invalid patterns and URLs
- `github-api`: Add rate limit handling

## Impact

- New validation utilities in utils.js
- Updated grep command with pattern validation
- Updated download command with URL validation
- Updated github.js with rate limit checks
- New error messages for security-related failures
