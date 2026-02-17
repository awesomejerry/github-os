## ADDED Requirements

### Requirement: Generate PKCE code_verifier and code_challenge
The system SHALL generate cryptographically secure PKCE parameters for OAuth flow. The code_verifier SHALL be a random string of 43-128 characters using characters [A-Z][a-z][0-9]-._~. The code_challenge SHALL be the SHA256 hash of code_verifier encoded in base64url format (no padding, URL-safe).

#### Scenario: Generate PKCE parameters
- **WHEN** initiateLogin() is called
- **THEN** system generates code_verifier with length between 43-128 characters
- **AND** system generates code_challenge as base64url(SHA256(code_verifier))
- **AND** both values are stored in localStorage under 'github_os_pkce_state'

#### Scenario: Base64url encoding is correct
- **WHEN** code_challenge is generated
- **THEN** result contains only [A-Za-z0-9_-] characters
- **AND** result has no padding characters (=)
- **AND** + is replaced with -
- **AND** / is replaced with _

### Requirement: Initiate OAuth login flow
The system SHALL redirect users to GitHub OAuth authorization endpoint with required PKCE parameters.

#### Scenario: Redirect to GitHub OAuth
- **WHEN** initiateLogin() is called
- **THEN** system redirects to https://github.com/login/oauth/authorize
- **AND** URL includes client_id parameter
- **AND** URL includes redirect_uri parameter
- **AND** URL includes scope parameter with value "repo user"
- **AND** URL includes code_challenge parameter
- **AND** URL includes code_challenge_method with value "S256"
- **AND** URL includes state parameter for CSRF protection

### Requirement: Handle OAuth callback
The system SHALL process OAuth callback by extracting authorization code from URL parameters and completing token exchange.

#### Scenario: Successful callback with code
- **WHEN** callback.html is loaded with 'code' URL parameter
- **THEN** system extracts code value
- **AND** system retrieves stored PKCE state from localStorage
- **AND** system calls exchangeCodeForToken with code and code_verifier

#### Scenario: Callback with error parameter
- **WHEN** callback.html is loaded with 'error' URL parameter
- **THEN** system displays error message to user
- **AND** system clears PKCE state from localStorage
- **AND** system redirects to index.html with error parameter

#### Scenario: Callback with missing PKCE state
- **WHEN** callback.html is loaded but 'github_os_pkce_state' is not in localStorage
- **THEN** system displays error "PKCE state not found"
- **AND** system redirects to index.html with error parameter

### Requirement: Exchange authorization code for access token
The system SHALL exchange authorization code and code_verifier for access token via GitHub token endpoint.

#### Scenario: Successful token exchange
- **WHEN** exchangeCodeForToken(code, verifier) is called with valid parameters
- **THEN** system makes POST request to https://github.com/login/oauth/access_token
- **AND** request includes client_id parameter
- **AND** request includes code parameter
- **AND** request includes code_verifier parameter
- **AND** request includes redirect_uri parameter
- **AND** request Accept header is "application/json"
- **AND** system receives access_token in response
- **AND** function returns token response object

#### Scenario: Token exchange failure
- **WHEN** token exchange request fails or returns error
- **THEN** system throws error with descriptive message
- **AND** PKCE state is cleared from localStorage

### Requirement: Validate access token
The system SHALL validate access tokens by making authenticated request to GitHub user API.

#### Scenario: Valid token
- **WHEN** validateToken(token) is called with valid token
- **THEN** system makes GET request to https://api.github.com/user
- **AND** request includes Authorization header with Bearer token
- **AND** function returns true if response is 200 OK

#### Scenario: Invalid or expired token
- **WHEN** validateToken(token) is called with invalid token
- **THEN** system makes GET request to https://api.github.com/user
- **AND** function returns false if response is 401 Unauthorized

#### Scenario: Network error during validation
- **WHEN** validateToken(token) encounters network error
- **THEN** function returns false
- **AND** error is logged but not thrown

### Requirement: Fetch authenticated user information
The system SHALL retrieve GitHub user profile data using access token.

#### Scenario: Fetch user info successfully
- **WHEN** fetchUserInfo(token) is called with valid token
- **THEN** system makes GET request to https://api.github.com/user
- **AND** request includes Authorization header with Bearer token
- **AND** function returns object with username, avatarUrl, and other profile data

#### Scenario: Fetch user info with invalid token
- **WHEN** fetchUserInfo(token) is called with invalid token
- **THEN** system throws error "Failed to fetch user info"
- **AND** error includes HTTP status code if available
