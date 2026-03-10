## MODIFIED Requirements

### Requirement: Releases Command
The system SHALL provide both `releases` and `release` commands to list repository releases.

#### Scenario: List releases via alias
- **GIVEN** the user is in a repository directory
- **WHEN** executing `release`
- **THEN** releases are listed using the same behavior and default count as `releases`

#### Scenario: List releases via alias with custom count
- **GIVEN** the user is in a repository directory
- **WHEN** executing `release 20`
- **THEN** 20 releases are listed
