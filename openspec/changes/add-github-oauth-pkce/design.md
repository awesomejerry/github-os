## Context

GitHub OS currently operates as an anonymous GitHub API client with the following limitations:
- Rate limit: 60 requests/hour per IP
- No access to private repositories
- No personalized features (username display, user-specific data)

This change introduces OAuth authentication using PKCE (Proof Key for Code Exchange) flow, which allows secure authentication without requiring a Client Secret - suitable for public clients like browser-based applications.

### Current State
- All API calls are unauthenticated
- No session management
- Prompt shows generic "guest" user

### Constraints
- Public client (cannot store Client Secret securely)
- Must work in browser environment
- Must support GitHub's OAuth 2.0 implementation
- Session data stored in localStorage

## Goals / Non-Goals

**Goals:**
- Implement complete PKCE OAuth flow for GitHub
- Enable authenticated API access with 5000 requests/hour limit
- Support access to private repositories when authorized
- Store session securely in browser localStorage
- Provide clear user feedback during login/logout process
- Support multi-account foundation (data structure ready)

**Non-Goals:**
- Token encryption in localStorage (Phase 2 enhancement)
- Multi-account switching UI (Phase 2)
- Token refresh mechanism (GitHub tokens don't expire)
- Enterprise GitHub support (only github.com for now)

## Decisions

### 1. OAuth Flow: PKCE instead of Client Secret
**Decision:** Use PKCE (Proof Key for Code Exchange) flow
**Rationale:** 
- Application is a public client (browser-based)
- Cannot securely store Client Secret in client-side code
- PKCE provides security without requiring secret
**Alternatives Considered:**
- Client Secret in code: Rejected - visible to all users
- Implicit flow: Rejected - deprecated by OAuth 2.1, less secure

### 2. Session Storage: localStorage
**Decision:** Store session data in localStorage with structured JSON format
**Rationale:**
- Simple to implement, works across page refreshes
- No server required
- Sufficient for this use case
**Alternatives Considered:**
- sessionStorage: Rejected - lost on browser close
- IndexedDB: Rejected - over-engineered for simple session data
- Cookies: Rejected - requires server-side handling

### 3. Session Data Structure
**Decision:** Use SessionData interface with username, token, metadata
**Rationale:**
- Follows shared-decisions.md specification
- Supports future multi-account feature
- Includes all necessary information for API calls and display
**Structure:**
```javascript
{
  username: string,
  accessToken: string,
  tokenType: 'bearer',
  scope: string,
  createdAt: number,
  avatarUrl?: string,
  isActive: boolean
}
```

### 4. PKCE Implementation Details
**Decision:** 
- code_verifier: 43-128 cryptographically random characters
- code_challenge: SHA256(code_verifier) base64url encoded
**Rationale:** Follows RFC 7636 specification
**Implementation:**
- Use Web Crypto API for random generation
- Use SubtleCrypto for SHA256
- Base64url encoding (no padding, URL-safe)

### 5. Callback Page Architecture
**Decision:** Dedicated callback.html that completes auth flow and redirects
**Rationale:**
- Clean separation of concerns
- Can handle errors gracefully
- Returns to main application with clear state
**Flow:**
1. Extract code from URL params
2. Retrieve PKCE state from localStorage
3. Exchange code + verifier for token
4. Fetch user info
5. Store session
6. Redirect to index.html

## Risks / Trade-offs

### Risk 1: Token Exposure in localStorage
**Risk:** Access tokens visible to any script with access to localStorage (XSS)
**Mitigation:** 
- Acceptable for this use case (no sensitive operations beyond GitHub API)
- Future: Consider encrypting tokens (Phase 2)
- Users should understand this is a browser-based app
**Severity:** Medium - acceptable for current scope

### Risk 2: PKCE State Loss
**Risk:** User closes browser during OAuth flow, losing PKCE state
**Mitigation:**
- Clear error message if callback cannot find PKCE state
- User can restart login flow
**Severity:** Low - easy to recover

### Risk 3: Token Validation Overhead
**Risk:** Validating token on every page load adds API call overhead
**Mitigation:**
- Only validate on app initialization
- Cache validation result
- If invalid, silently clear session
**Severity:** Low - acceptable tradeoff for security

### Risk 4: Rate Limit Confusion
**Risk:** Users may not understand why rate limits differ between auth states
**Mitigation:**
- Display current rate limit in status command
- Clear feedback when unauthenticated vs authenticated
**Severity:** Low - documentation and UI feedback sufficient

## Open Questions

None - all technical decisions are resolved based on shared-decisions.md and requirements.
