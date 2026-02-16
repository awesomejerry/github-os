# releases-command Specification

## Purpose
TBD - created by archiving change add-releases-command. Update Purpose after archive.
## Requirements
### Requirement: Releases Command
The system SHALL provide a `releases` command to list repository releases.

#### Scenario: List releases (default count)
- **GIVEN** the user is in a repository directory
- **WHEN** executing `releases`
- **THEN** releases are listed with tag name, release name, author, published date (default: 10)

#### Scenario: List releases with custom count
- **GIVEN** the user is in a repository directory
- **WHEN** executing `releases 20`
- **THEN** 20 releases are listed

#### Scenario: No releases in repository
- **GIVEN** the user is in a repository directory
- **AND** the repository has no releases
- **WHEN** executing `releases`
- **THEN** a message "No releases found" is displayed

#### Scenario: Not in a repository
- **GIVEN** the user is at root directory `/`
- **WHEN** executing `releases`
- **THEN** an error "Not in a repository" is displayed

#### Scenario: Pre-release indicator
- **GIVEN** a release is marked as pre-release
- **WHEN** listing releases
- **THEN** a pre-release indicator `[prerelease]` is displayed

#### Scenario: Rate limit handling
- **GIVEN** the GitHub API rate limit is exceeded
- **WHEN** executing `releases`
- **THEN** a rate limit error message is displayed

