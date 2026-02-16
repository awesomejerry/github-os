## ADDED Requirements

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
