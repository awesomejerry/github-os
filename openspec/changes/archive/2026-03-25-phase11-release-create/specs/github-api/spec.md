## ADDED Requirements

### Requirement: Create Release API
The system SHALL create repository releases via GitHub API.

#### Scenario: Create release successfully
- **GIVEN** valid auth and payload
- **WHEN** `createRelease(owner, repo, payload)` is called
- **THEN** GitHub release is created and normalized release data is returned

#### Scenario: Validation error
- **GIVEN** invalid payload (e.g. duplicate tag)
- **WHEN** `createRelease` is called
- **THEN** a clear validation error is returned
