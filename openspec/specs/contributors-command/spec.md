# contributors-command Specification

## Purpose
TBD - created by archiving change add-contributors-command. Update Purpose after archive.
## Requirements
### Requirement: Contributors Command
The system SHALL provide a `contributors` command to list repository contributors.

#### Scenario: List contributors (default count)
- **GIVEN** the user is in a repository directory
- **WHEN** executing `contributors`
- **THEN** top 20 contributors are listed with username and contribution count
- **AND** contributors are sorted by contribution count (highest first)

#### Scenario: List N contributors
- **GIVEN** the user is in a repository directory
- **WHEN** executing `contributors 50`
- **THEN** top 50 contributors are listed

#### Scenario: No contributors in repository
- **GIVEN** the user is in a repository directory
- **AND** the repository has no contributors
- **WHEN** executing `contributors`
- **THEN** a message "No contributors found" is displayed

#### Scenario: Not in a repository
- **GIVEN** the user is at root directory `/`
- **WHEN** executing `contributors`
- **THEN** an error "Not in a repository" is displayed

#### Scenario: Invalid count argument
- **GIVEN** the user is in a repository directory
- **WHEN** executing `contributors -5`
- **THEN** a usage error is displayed

#### Scenario: Rate limit handling
- **GIVEN** the GitHub API rate limit is exceeded
- **WHEN** executing `contributors`
- **THEN** a rate limit error message is displayed

#### Scenario: Stats not ready
- **GIVEN** the GitHub API returns 204 (stats being computed)
- **WHEN** executing `contributors`
- **THEN** an empty contributors list is returned

