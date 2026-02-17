# Tasks - add-github-oauth-pkce

## 1. PKCE Implementation

- [x] 1.1 Create generateRandomString() function for cryptographically secure random generation
- [x] 1.2 Create base64urlEncode() function (no padding, URL-safe)
- [x] 1.3 Create sha256() helper using Web Crypto API
- [x] 1.4 Create generatePKCE() function returning code_verifier and code_challenge

## 2. OAuth Flow

- [x] 2.1 Create storePKCEState() to save PKCE state to localStorage
- [x] 2.2 Create retrievePKCEState() to get PKCE state from localStorage
- [x] 2.3 Create clearPKCEState() to remove PKCE state
- [x] 2.4 Create initiateLogin() - redirect to GitHub OAuth with PKCE params

## 3. Token Exchange

- [x] 3.1 Create exchangeCodeForToken() - POST to GitHub token endpoint
- [x] 3.2 Handle token response errors
- [x] 3.3 Create validateToken() - verify token with GitHub user API
- [x] 3.4 Create fetchUserInfo() - get user profile with token

## 4. Callback Handler

- [x] 4.1 Create handleCallback() - process OAuth callback
- [x] 4.2 Handle error parameters from GitHub
- [x] 4.3 Validate state for CSRF protection
- [x] 4.4 Exchange code for token
- [x] 4.5 Fetch user info and save session

## 5. Callback Page

- [x] 5.1 Create callback.html with loading UI
- [x] 5.2 Import and call handleCallback()
- [x] 5.3 Display success/error messages
- [x] 5.4 Redirect to index.html on completion

## 6. Integration

- [ ] 6.1 Update github.js to use auth headers when session exists
- [ ] 6.2 Update terminal.js prompt to show logged-in username
- [ ] 6.3 Add login/logout/status commands to commands.js
- [ ] 6.4 Test complete OAuth flow
