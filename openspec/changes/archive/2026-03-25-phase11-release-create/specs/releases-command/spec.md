## MODIFIED Requirements

### Requirement: Releases Command
The system SHALL support creating a release from terminal command.

#### Scenario: Create release with tag
- **GIVEN** user is authenticated and in a repository directory
- **WHEN** executing `release create v2.6.0 -t "v2.6.0" -b "notes"`
- **THEN** a new release is created
- **AND** the command shows release URL

#### Scenario: Missing tag
- **GIVEN** user is in a repository directory
- **WHEN** executing `release create`
- **THEN** usage guidance is displayed

#### Scenario: Not authenticated
- **GIVEN** user is not authenticated
- **WHEN** executing `release create <tag>`
- **THEN** command shows authentication-required error
