## ADDED Requirements

### Requirement: Release Retrieval API
The system SHALL retrieve a release by tag via GitHub API.

#### Scenario: Fetch release by tag
- **GIVEN** owner, repo, and tag are valid
- **WHEN** `fetchReleaseByTag(owner, repo, tag)` is called
- **THEN** it returns normalized release data including notes and URL

#### Scenario: Tag not found
- **GIVEN** tag does not exist
- **WHEN** `fetchReleaseByTag` is called
- **THEN** it throws a clear "Release not found" error
