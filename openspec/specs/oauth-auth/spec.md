# OAuth Authentication Specification

## Purpose

GitHub OAuth PKCE flow for user authentication.

---

## Requirements

### Requirement: Generate PKCE challenge
The system SHALL generate PKCE code verifier and challenge.

#### Scenario: Generate code verifier
- WHEN initiating login
- THEN a cryptographically secure code_verifier is generated (43-128 chars)
- AND a code_challenge is derived using S256 method
- AND the code_verifier is stored in sessionStorage

---

### Requirement: Redirect to GitHub
The system SHALL redirect user to GitHub authorization.

#### Scenario: Start OAuth flow
- WHEN executing `login`
- THEN user is redirected to GitHub authorization URL
- AND the URL includes client_id, redirect_uri, scope, code_challenge

---

### Requirement: Handle OAuth callback
The system SHALL exchange authorization code for access token.

#### Scenario: Successful token exchange
- GIVEN the user authorized the application
- WHEN GitHub redirects back with authorization code
- THEN the code is exchanged for access token via worker proxy
- AND the access token is stored in localStorage
- AND the user session is established

#### Scenario: User denies authorization
- GIVEN the user denied authorization
- WHEN GitHub redirects back with error
- THEN an error message is displayed
- AND no session is created

---

### Requirement: Validate existing token
The system SHALL validate stored tokens on app load.

#### Scenario: Valid token
- GIVEN a valid access token is stored
- WHEN the app loads
- THEN the token is validated against GitHub API
- AND the user session is restored

#### Scenario: Expired or revoked token
- GIVEN an invalid access token is stored
- WHEN the app loads
- THEN the session is cleared
- AND the user is prompted to login again

---

## Files

- `scripts/auth.js` - OAuth implementation
- `callback.html` - OAuth callback handler
- `github-os-worker/` - Token exchange proxy

## Status

✅ Implemented in v2.0.0
