## ADDED Requirements

### Requirement: Save session to localStorage
The system SHALL save session data to localStorage under key `github_os_session`.

#### Scenario: Save new session
- **WHEN** saveSession is called with valid SessionData
- **THEN** session is stored in localStorage under `github_os_session`
- **AND** session is added to `github_os_sessions` array

#### Scenario: Save session updates existing
- **WHEN** saveSession is called for existing username
- **THEN** existing session is updated in `github_os_sessions` array

### Requirement: Load current session
The system SHALL load the active session from localStorage.

#### Scenario: Load existing session
- **WHEN** loadSession is called
- **AND** `github_os_session` key exists in localStorage
- **THEN** system returns SessionData object

#### Scenario: Load non-existent session
- **WHEN** loadSession is called
- **AND** `github_os_session` key does not exist
- **THEN** system returns null

### Requirement: Load all sessions
The system SHALL load all stored sessions for multi-account support.

#### Scenario: Load multiple sessions
- **WHEN** loadAllSessions is called
- **AND** `github_os_sessions` key exists with valid array
- **THEN** system returns array of SessionData objects

#### Scenario: Load empty sessions
- **WHEN** loadAllSessions is called
- **AND** `github_os_sessions` key does not exist
- **THEN** system returns empty array

### Requirement: Clear current session
The system SHALL remove the current session from localStorage.

#### Scenario: Clear active session
- **WHEN** clearSession is called
- **THEN** `github_os_session` key is removed from localStorage
- **AND** session is removed from `github_os_sessions` array

### Requirement: Clear all sessions
The system SHALL remove all sessions from localStorage.

#### Scenario: Clear all sessions
- **WHEN** clearAllSessions is called
- **THEN** both `github_os_session` and `github_os_sessions` keys are removed

### Requirement: Switch active account
The system SHALL switch the active account to a different stored session.

#### Scenario: Switch to existing account
- **WHEN** switchAccount is called with valid username
- **AND** session exists for that username
- **THEN** that session becomes active in `github_os_session`
- **AND** `isActive` flag is updated in all sessions

#### Scenario: Switch to non-existent account
- **WHEN** switchAccount is called with unknown username
- **THEN** system returns false
- **AND** current session remains unchanged

### Requirement: Check authentication status
The system SHALL provide a way to check if user is authenticated.

#### Scenario: User is authenticated
- **WHEN** isAuthenticated is called
- **AND** valid session exists in localStorage
- **THEN** system returns true

#### Scenario: User is not authenticated
- **WHEN** isAuthenticated is called
- **AND** no valid session exists
- **THEN** system returns false

### Requirement: Get access token
The system SHALL provide access to the current access token.

#### Scenario: Get token from active session
- **WHEN** getAccessToken is called
- **AND** valid session exists
- **THEN** system returns the accessToken string

#### Scenario: Get token when not authenticated
- **WHEN** getAccessToken is called
- **AND** no session exists
- **THEN** system returns null

### Requirement: Handle localStorage errors gracefully
The system SHALL handle localStorage errors without throwing exceptions.

#### Scenario: Handle JSON parse errors
- **WHEN** loading session data
- **AND** localStorage contains invalid JSON
- **THEN** system returns null (not an exception)

#### Scenario: Handle localStorage unavailable
- **WHEN** localStorage is not available
- **THEN** all functions return null or empty array as appropriate
