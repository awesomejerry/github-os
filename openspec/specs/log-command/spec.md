# log-command Specification

## Purpose
TBD - created by archiving change add-log-command. Update Purpose after archive.
## Requirements
### Requirement: `log` - Display Commit History
The system SHALL display recent commit history for the current repository.

#### Scenario: Display default commits
- **GIVEN** the user is in a repository
- **WHEN** executing `log`
- **THEN** the last 10 commits are displayed
- **AND** each commit shows short hash, author, date, and message

#### Scenario: Custom commit count
- **GIVEN** the user is in a repository
- **WHEN** executing `log 20`
- **THEN** the last 20 commits are displayed

#### Scenario: Not in a repository
- **GIVEN** the user is at root (`/`)
- **WHEN** executing `log`
- **THEN** an error "Not in a repository" is displayed

#### Scenario: Empty repository
- **GIVEN** the repository has no commits
- **WHEN** executing `log`
- **THEN** "No commits yet" is displayed

#### Scenario: Commit display format
- **GIVEN** commits exist
- **WHEN** displaying commits
- **THEN** each commit shows:
  - Short hash (7 characters) in accent color
  - Author name
  - Relative date (e.g., "2 days ago")
  - Commit message (first line, truncated if needed)

