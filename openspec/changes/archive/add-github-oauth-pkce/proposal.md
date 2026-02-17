## Why

Currently, the GitHub OS application operates as an anonymous client with limited API access (60 requests/hour) and no access to private repositories. Users need OAuth authentication to access their private repos, increase rate limits to 5000 requests/hour, and enable personalized features like displaying their username in the prompt.

## What Changes

- Add PKCE-based OAuth authentication flow (no Client Secret required)
- Create `scripts/auth.js` with OAuth functions: generatePKCE(), initiateLogin(), handleCallback(), exchangeCodeForToken(), validateToken(), fetchUserInfo()
- Create `callback.html` to handle OAuth callback and complete token exchange
- Store sessions in localStorage with structured SessionData format
- Update GitHub API calls to include authentication headers when logged in
- Add login/logout/status commands
- Update terminal prompt to show logged-in username
- **BREAKING**: GitHub API module will now require authentication for private repo access

## Capabilities

### New Capabilities

- `oauth-auth`: OAuth PKCE authentication flow with code_verifier/code_challenge generation, token exchange, and validation
- `session-management`: Session storage in localStorage, multi-account support foundation, token persistence

### Modified Capabilities

- `github-api`: Add authentication header support, return private repos when authenticated, handle rate limit information with auth headers

## Impact

- **New Files**: `scripts/auth.js`, `callback.html`
- **Modified Files**: `scripts/github.js` (add auth headers), `scripts/commands.js` (add auth commands), `scripts/terminal.js` (update prompt)
- **localStorage**: New keys `github_os_session`, `github_os_sessions`, `github_os_pkce_state`
- **API**: All GitHub API calls will check for session and add Authorization header
- **User Experience**: Prompt changes from `guest@github-os` to `<username>@github-os`
