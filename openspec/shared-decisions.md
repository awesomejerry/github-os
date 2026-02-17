# Shared Decisions - GitHub OS v2.0 Auth

> 所有 auth 相關模組必須遵守此文件定義的規範

---

## 1. OAuth Configuration

### Client ID
```javascript
const OAUTH_CONFIG = {
  clientId: 'Ov23liAdo8bSKYgsNNQ9',
  redirectUri: 'https://awesomejerry.github.io/github-os/callback.html',
  scope: 'repo user',
  authUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token'
};
```

### OAuth Flow (PKCE - 無需 Client Secret)
```
1. Generate code_verifier (random string)
2. Generate code_challenge = SHA256(code_verifier) base64url
3. Redirect to GitHub with code_challenge
4. GitHub redirects back with code
5. Exchange code + code_verifier for access_token
6. Store token in localStorage
```

---

## 2. Session Data Structure

### localStorage Keys
```javascript
// Primary session
'github_os_session' → SessionData
'github_os_sessions' → SessionData[]  // Multi-account

// PKCE state
'github_os_pkce_state' → { code_verifier, state }
```

### SessionData Interface
```typescript
interface SessionData {
  username: string;           // GitHub username
  accessToken: string;        // OAuth access token
  tokenType: 'bearer';        // Always 'bearer'
  scope: string;              // Granted scopes
  createdAt: number;          // Timestamp
  expiresAt?: number;         // Optional (GitHub tokens don't expire)
  avatarUrl?: string;         // User avatar
  isActive: boolean;          // Current active session
}
```

### Example
```json
{
  "username": "awesomejerry",
  "accessToken": "gho_xxxxx",
  "tokenType": "bearer",
  "scope": "repo,user",
  "createdAt": 1739765432000,
  "avatarUrl": "https://avatars.githubusercontent.com/u/123456",
  "isActive": true
}
```

---

## 3. API Functions

### Auth Module (`scripts/auth.js`)

```javascript
// Exported functions
export function initiateLogin();           // Start OAuth flow
export function handleCallback();          // Process OAuth callback
export function exchangeCodeForToken(code, verifier);  // Get token from code
export function generatePKCE();            // Generate code_verifier + challenge
export function validateToken(token);      // Check if token is valid
export function fetchUserInfo(token);      // Get user info from GitHub
```

### Session Module (`scripts/session.js`)

```javascript
// Exported functions
export function saveSession(sessionData);  // Save to localStorage
export function loadSession();             // Get current session
export function loadAllSessions();         // Get all sessions
export function clearSession();            // Logout current
export function clearAllSessions();        // Logout all
export function switchAccount(username);   // Switch active account
export function isAuthenticated();         // Check if logged in
export function getAccessToken();          // Get current token
```

### GitHub API Integration

When authenticated, use token in API calls:
```javascript
// In github.js - add auth header when session exists
const token = getAccessToken();
const headers = {
  'Accept': 'application/vnd.github.v3+json',
  ...(token && { 'Authorization': `Bearer ${token}` })
};
```

---

## 4. Commands

### `login`
```
Usage: login
Output: Opening GitHub login...
        (redirects to GitHub OAuth)
        
On success: Connected as awesomejerry (23 repos)
On error: Login failed: <reason>
```

### `logout`
```
Usage: logout
Output: Logged out from awesomejerry
        (or: No active session)
```

### `status`
```
Usage: status
Output: Logged in as: awesomejerry
        Token scope: repo, user
        Rate limit: 4987/5000 (resets in 45 min)
        
        (or: Not logged in. Use 'login' to connect.)
```

### `whoami` (updated)
```
Usage: whoami
Output: GitHub user: awesomejerry (logged in)
        (or: GitHub user: awesomejerryshen (default, not logged in))
```

---

## 5. UI/UX Changes

### Prompt Format
```
# Before (anonymous)
guest@github-os:~$

# After (logged in)
awesomejerry@github-os:~$

# Multiple accounts
awesomejerry@github-os[work]:~$
```

### Private Repo Indicator
```
$ ls

my-public-repo/       [JavaScript] ★42
🔒 my-private-repo/   [Python]     ★5
```

### Loading States
- `login`: "Connecting to GitHub..."
- `logout`: "Logging out..."

### Error Handling
- Invalid/expired token → Clear session, show login prompt
- Rate limit exceeded → Show time until reset
- OAuth error → Display error from GitHub

---

## 6. Security Considerations

### Token Storage
- Store in localStorage (acceptable for public client)
- Consider: Encrypt token before storage (optional enhancement)

### PKCE Flow
- Always use PKCE for public clients
- code_verifier: 43-128 chars, cryptographically random
- code_challenge: SHA256(code_verifier) base64url encoded

### Token Validation
- On app load: Validate stored token with `/user` API
- If invalid: Clear session silently

### Callback Page
- `callback.html` should:
  - Extract code from URL
  - Retrieve stored PKCE state
  - Exchange code for token
  - Store session
  - Redirect to main page with success message

---

## 7. Rate Limit Handling

### Response Headers
```javascript
const rateLimit = {
  limit: response.headers['x-ratelimit-limit'],      // 5000 (auth) or 60
  remaining: response.headers['x-ratelimit-remaining'],
  reset: response.headers['x-ratelimit-reset'],      // Unix timestamp
};
```

### Display
```bash
$ status
Rate limit: 4987/5000 (resets in 45 min)
```

---

## 8. Multi-Account (Phase 2 of Auth)

### Commands
```
account              # List all connected accounts
account add          # Add another account (login flow)
account remove <user>  # Remove account
switch <user>        # Switch to another account
```

### Session Management
```javascript
// Active session
github_os_session → { ...sessionData, isActive: true }

// All sessions
github_os_sessions → [
  { username: "awesomejerry", isActive: true },
  { username: "work-account", isActive: false }
]
```

---

## 9. File Structure

```
scripts/
├── auth.js          # OAuth flow (NEW)
├── session.js       # Session management (NEW)
├── commands.js      # Add login/logout/status commands
├── github.js        # Add auth header support
├── terminal.js      # Update prompt format
└── app.js           # Init session on load

callback.html        # OAuth callback page (NEW)
styles/
└── main.css         # Add private repo indicator styles
```

---

## 10. Testing Strategy

### Unit Tests
- `auth.js`: PKCE generation, token exchange
- `session.js`: localStorage operations, account switching

### E2E Tests
- Login flow (mock OAuth)
- Logout flow
- Private repo access
- Rate limit display

---

*Last updated: 2026-02-17*
*Version: v2.0-alpha*
