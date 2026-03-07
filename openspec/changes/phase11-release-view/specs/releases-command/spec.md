## MODIFIED Requirements

### Requirement: Releases Command
The system SHALL support viewing detailed release information by tag.

#### Scenario: View release by tag
- **GIVEN** the user is in a repository directory
- **WHEN** executing `release view v1.2.3`
- **THEN** the system shows that release's tag, name, author, publish time, notes, and URL

#### Scenario: Missing tag
- **GIVEN** the user is in a repository directory
- **WHEN** executing `release view`
- **THEN** the system shows usage guidance for `release view <tag>`

#### Scenario: Release not found
- **GIVEN** the user is in a repository directory
- **WHEN** executing `release view <tag>` for a non-existent tag
- **THEN** the system displays a clear not-found error
