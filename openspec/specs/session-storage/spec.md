# Session Storage Spec

## Overview

Session management for persisting authentication state.

## Requirements

### 1. Session Structure
```javascript
{
  username: string,
  accessToken: string,
  scope: string,
  loginTime: timestamp
}
```

### 2. Storage Operations
- `loadSession()` - Load session from localStorage
- `saveSession(data)` - Save session to localStorage
- `clearSession()` - Clear session data
- `isAuthenticated()` - Check if valid session exists
- `getAccessToken()` - Get current access token

### 3. Account Switching
- Support multiple accounts (future)
- Switch between accounts
- Clear specific account session

### 4. Security
- Never log access token
- Clear on logout
- Validate on load

## Files

- `scripts/session.js` - Session management

## Status

✅ Implemented in v2.0.0
