# OAuth Authentication Spec

## Overview

GitHub OAuth PKCE flow for user authentication.

## Requirements

### 1. PKCE Code Generation
- Generate cryptographically secure code_verifier (43-128 chars)
- Generate code_challenge using S256 method
- Store code_verifier in sessionStorage for callback

### 2. OAuth Flow
- Redirect user to GitHub authorization URL
- Include client_id, redirect_uri, scope, code_challenge
- Handle callback with code parameter
- Exchange code for access token via worker proxy

### 3. Token Storage
- Store access_token in localStorage (encrypted)
- Include token scope and expiration info
- Clear token on logout

### 4. Token Validation
- Validate token on app load
- Check token scope matches required permissions
- Handle expired/revoked tokens gracefully

## Files

- `scripts/auth.js` - OAuth implementation
- `callback.html` - OAuth callback handler
- `github-os-worker/` - Token exchange proxy

## Status

✅ Implemented in v2.0.0
