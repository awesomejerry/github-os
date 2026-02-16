# Issues Command Specification

## ADDED Requirements

### Requirement: Issues Command
The system SHALL provide an `issues` command to list repository issues.

#### Scenario: List open issues (default)
- **GIVEN** the user is in a repository directory
- **WHEN** executing `issues`
- **THEN** open issues are listed with number, title, author, labels, and created date

#### Scenario: List closed issues
- **GIVEN** the user is in a repository directory
- **WHEN** executing `issues --closed`
- **THEN** only closed issues are listed

#### Scenario: List all issues
- **GIVEN** the user is in a repository directory
- **WHEN** executing `issues --all`
- **THEN** both open and closed issues are listed

#### Scenario: No issues in repository
- **GIVEN** the user is in a repository directory
- **AND** the repository has no issues
- **WHEN** executing `issues`
- **THEN** a message "No open issues found" is displayed

#### Scenario: Not in a repository
- **GIVEN** the user is at root directory `/`
- **WHEN** executing `issues`
- **THEN** an error "Not in a repository" is displayed

#### Scenario: Pull requests are filtered out
- **GIVEN** the GitHub API returns both issues and pull requests
- **WHEN** executing `issues`
- **THEN** only issues are displayed (no pull requests)

#### Scenario: Rate limit handling
- **GIVEN** the GitHub API rate limit is exceeded
- **WHEN** executing `issues`
- **THEN** a rate limit error message is displayed
