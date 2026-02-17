## Why

GitHub OS v2.0 needs persistent authentication state management to support OAuth login flow, multi-account support, and secure token storage. Without session management, users would need to re-authenticate on every page load, and there's no way to manage multiple GitHub accounts.

## What Changes

- Create new `scripts/session.js` module with localStorage-based session management
- Implement `SessionData` interface as defined in shared-decisions.md
- Support multi-account management (store all sessions, mark one as active)
- Provide clean API for auth module integration

## Capabilities

### New Capabilities
- `session-storage`: localStorage-based session persistence with SessionData structure, supporting single and multi-account scenarios

### Modified Capabilities
- None (new capability, no existing requirements changing)

## Impact

- **New file**: `scripts/session.js` - Session management module
- **localStorage keys**: `github_os_session`, `github_os_sessions`
- **Integration points**: Will be used by `auth.js` (to be created) and `app.js` (for initialization)
