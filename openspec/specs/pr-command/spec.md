# pr-command Specification

## Purpose

Provide Pull Request list and view functionality for GitHub OS terminal.

## Requirements

### Requirement: PR List Command
The system SHALL provide a `pr` command to list repository pull requests.

#### Scenario: List open PRs (default)
- **GIVEN** the user is in a repository directory
- **WHEN** executing `pr`
- **THEN** open pull requests are listed with number, title, author, labels, and created date

#### Scenario: List all PRs
- **GIVEN** the user is in a repository directory
- **WHEN** executing `pr --all`
- **THEN** all pull requests (open, closed, merged) are listed

#### Scenario: No PRs in repository
- **GIVEN** the user is in a repository directory
- **AND** the repository has no pull requests matching the filter
- **WHEN** executing `pr`
- **THEN** a message "No open pull requests found" is displayed

#### Scenario: Not in a repository
- **GIVEN** the user is at root directory `/`
- **WHEN** executing `pr`
- **THEN** an error "Not in a repository. Use 'cd' to enter a repo first." is displayed

#### Scenario: Rate limit handling
- **GIVEN** the GitHub API rate limit is exceeded
- **WHEN** executing `pr`
- **THEN** a rate limit error message is displayed

### Requirement: PR View Command
The system SHALL provide a `pr view` command to display PR details.

#### Scenario: View PR details
- **GIVEN** the user is in a repository directory
- **WHEN** executing `pr view 123`
- **THEN** detailed PR information is displayed:
  - Title and number
  - State (open/closed/merged)
  - Author
  - Base and head branches
  - Created date
  - Body/description (truncated if too long)
  - URL

#### Scenario: PR not found
- **GIVEN** the PR number does not exist
- **WHEN** executing `pr view 999`
- **THEN** an error "Pull request not found" is displayed

#### Scenario: Invalid PR number
- **GIVEN** the user provides non-numeric input
- **WHEN** executing `pr view abc`
- **THEN** an error "Invalid PR number" is displayed
