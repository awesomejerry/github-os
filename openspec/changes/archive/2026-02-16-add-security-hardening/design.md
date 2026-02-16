## Context

GitHub OS accepts user input that is used in:
1. Regex patterns (grep command)
2. Download URLs (download command)
3. API responses displayed to users

Without validation, these can cause security issues or poor UX.

## Goals / Non-Goals

**Goals:**
- Prevent ReDoS attacks via regex pattern validation
- Prevent MITM attacks via URL validation
- Improve UX with rate limit notifications
- Prevent XSS via consistent HTML escaping

**Non-Goals:**
- Authentication (app uses unauthenticated GitHub API)
- Full security audit (focus on identified issues)

## Decisions

### Pattern Validation
- Max length: 100 characters
- Reject dangerous patterns: `(a+)+`, `(a*)+`, large quantifiers
- Provide clear error message to user

### URL Validation
- Must be HTTPS only
- Must be GitHub domains only:
  - github.com
  - raw.githubusercontent.com
  - api.github.com
  - codeload.github.com
- Reject all other URLs with security error

### Rate Limit Handling
- Check for 403 status
- Read X-RateLimit-Reset header
- Show user-friendly message with minutes until reset

### HTML Escaping
- Use existing `escapeHtml()` function
- Apply to all user/API content rendered via innerHTML
- Keep `textContent` for code blocks (already safe)

## Risks / Trade-offs

- **False positives**: Some valid patterns might be rejected → Acceptable trade-off for security
- **Stricter URL policy**: Some GitHub features might use different domains → Can expand allowed list later
