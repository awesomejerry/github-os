## ADDED Requirements

### Requirement: Rate Limit Detection
The system SHALL detect and notify users of GitHub API rate limits.

#### Scenario: Rate limit exceeded
- **GIVEN** the GitHub API returns 403 Forbidden
- **AND** X-RateLimit-Remaining header is 0
- **WHEN** an API call fails
- **THEN** a user-friendly message is displayed
- **AND** the message includes estimated time until reset

#### Scenario: Normal API response
- **GIVEN** the GitHub API returns a normal response
- **WHEN** an API call succeeds
- **THEN** no rate limit message is shown
