# Shared Decisions - GitHub OS v2.3.5

> 所有模組必須遵守此文件定義的規範

---

## 1. OAuth Configuration

### Client ID
```javascript
const OAUTH_CONFIG = {
  clientId: 'Ov23liAdo8bSKYgsNNQ9',
  redirectUri: 'https://www.awesomejerry.space/github-os/callback.html',
  scope: 'repo user',
  authUrl: 'https://github.com/login/oauth/authorize',
  tokenProxyUrl: 'https://github-os-token.awesomejerryshen.workers.dev'
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
├── auth.js          # OAuth PKCE flow + token exchange via worker
├── session.js       # Session management (localStorage)
├── commands.js      # login/logout/status commands + cache clearing
├── github.js        # Auth header support + clearCache()
├── terminal.js      # Dynamic prompt (username/guest)
├── app.js           # Session validation on init + cache clearing
├── config.js        # Configuration
└── utils.js         # Utilities

callback.html        # OAuth callback page

github-os-worker/    # Cloudflare Worker (for CORS-free token exchange)
├── worker.js        # Token exchange endpoint
├── wrangler.toml    # Cloudflare config
└── README.md        # Deploy instructions

styles/
└── main.css         # Terminal styles

tests/unit/
├── auth.test.js     # Auth module tests
├── session.test.js  # Session module tests
├── github.test.js   # GitHub API tests
└── ...
```

## 10. Token Exchange (Cloudflare Worker)

Due to CORS restrictions, token exchange must go through a backend proxy.

### Worker Endpoint
```
POST https://github-os-token.awesomejerryshen.workers.dev

Body: { code, code_verifier, redirect_uri }
Response: { access_token, token_type, scope }
```

### Secrets
- `GITHUB_CLIENT_SECRET` - Set via `wrangler secret put`

---

## 11. Staging Workflow (v2.2)

### Staging Area (scripts/staging.js)
```javascript
// localStorage key: github_os_staging
{
  creates: { "path": content },
  updates: { "path": { content, sha } },
  deletes: { "path": sha }
}
```

### Commands
- `touch`, `mkdir`, `rm`, `mv`, `cp`, `edit` → Stage changes
- `status` → Show staged changes
- `commit -m "msg"` → Batch commit all staged
- `add <file>` → Stage file
- `unstage <file>` → Remove from staging
- `diff` → Show staged diff

### Batch Commit (GitHub Git Data API)
1. Get base commit SHA from branch ref
2. Create blobs for each create/update
3. Create new tree with all changes
4. Create commit with message
5. Update branch ref to new commit

---

## 12. PR Operations (v2.3)

### GitHub API Endpoints
```javascript
// List PRs
GET /repos/{owner}/{repo}/pulls?state=open|all&per_page=30

// Get PR details
GET /repos/{owner}/{repo}/pulls/{number}

// Create PR
POST /repos/{owner}/{repo}/pulls
Body: { title, body, head, base }

// Merge PR
PUT /repos/{owner}/{repo}/pulls/{number}/merge
Body: { commit_title, merge_method: "merge" }

// Close PR
PATCH /repos/{owner}/{repo}/pulls/{number}
Body: { state: "closed" }
```

### Commands (scripts/commands.js)
- `cmdPr` - PR dispatcher
- `cmdPrView` - View PR details
- `cmdPrCreate` - Create PR (interactive/direct)
- `cmdPrMerge` - Merge PR (with confirmation)
- `cmdPrClose` - Close PR (with confirmation)

### Error Codes
- 401: Authentication required
- 403: Permission denied
- 404: PR not found
- 405: Not mergeable
- 409: Merge conflict
- 422: Validation failed

---

## 13. Theme System (v2.3)

### Available Themes
- `dark` (default)
- `light`
- `solarized-dark`
- `solarized-light`
- `monokai`
- `gruvbox`

### localStorage
```javascript
// key: github_os_theme
{ name: "dark" }
```

### DOM Classes
```html
<html class="theme-dark">
```

---

## 14. Keyboard Shortcuts (v2.3)

| Shortcut | Action | Implementation |
|----------|--------|----------------|
| `Ctrl+L` | Clear screen | `terminal.clear()` |
| `Ctrl+U` | Clear input line | `input.value = ''` |
| `Ctrl+K` | Clear to end | Slice input value |
| `Ctrl+A` | Go to start | `input.selectionStart = 0` |
| `Ctrl+E` | Go to end | `input.selectionStart = length` |
| `↑/↓` | History | Already implemented |

---

## 15. Command Signature Convention

**All commands must follow this signature:**
```javascript
function cmdXxx(terminal, githubUser, args) { ... }
```

**Called by app.js as:**
```javascript
commands[cmd](this.terminal, this.githubUser, args, this);
```

**Example Bug (v2.3.1-v2.3.2):**
```javascript
// Wrong - caused "Unknown theme command: a"
function cmdTheme(terminal, args) { ... }

// Correct
function cmdTheme(terminal, githubUser, args) { ... }
```

---

## 16. Testing Strategy (v2.3.4)

### Test Types
| Type | Location | Purpose |
|------|----------|---------|
| Unit | `tests/unit/` | Module functionality |
| Integration | `tests/integration/` | Command signatures |
| E2E | `tests/e2e/` | User flow simulation |

### Key Lessons

1. **Unit tests ≠ Integration tests** - Module tests don't catch signature bugs
2. **Integration tests for commands** - Verify how commands are called
3. **E2E tests simulate users** - Test actual user input flow

### Case Studies
- See `memory/testing-principles.md` for documented cases

---

*Last updated: 2026-02-19*
*Version: v2.3.4*
