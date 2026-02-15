## ADDED Requirements

### Requirement: Fetch Repository Commits
The system SHALL fetch commit history for a repository.

#### Scenario: Successful fetch
- **GIVEN** a valid owner and repo
- **WHEN** fetching commits with a count
- **THEN** up to the requested number of commits are returned
- **AND** each commit includes: sha, author name, date, and message

#### Scenario: Empty repository
- **GIVEN** a repository with no commits
- **WHEN** fetching commits
- **THEN** an empty array is returned

#### Scenario: Caching
- **GIVEN** commits have been fetched for a repository
- **WHEN** requesting the same commits again
- **THEN** cached data is returned without new API call

#### Scenario: API error
- **GIVEN** the GitHub API returns an error
- **WHEN** fetching commits
- **THEN** an appropriate error is raised
