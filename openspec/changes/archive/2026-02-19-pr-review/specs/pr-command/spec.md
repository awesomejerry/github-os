## ADDED Requirements

### Requirement: PR Review Command
The system SHALL provide a `pr review` command to view and submit PR reviews.

#### Scenario: View PR for review
- **GIVEN** the user is in a repository directory
- **WHEN** executing `pr review 123`
- **THEN** PR files are listed with filename, additions, deletions, and status

#### Scenario: Approve PR
- **GIVEN** the user is authenticated
- **AND** the user is in a repository directory
- **WHEN** executing `pr review 123 --approve`
- **THEN** an approving review is submitted
- **AND** a success message is displayed

#### Scenario: Request changes on PR
- **GIVEN** the user is authenticated
- **AND** the user is in a repository directory
- **WHEN** executing `pr review 123 --request-changes`
- **THEN** a review requesting changes is submitted
- **AND** a success message is displayed

#### Scenario: Add review comment
- **GIVEN** the user is authenticated
- **AND** the user is in a repository directory
- **WHEN** executing `pr review 123 --comment "LGTM!"`
- **THEN** a review comment is submitted
- **AND** a success message is displayed

#### Scenario: Review requires authentication
- **GIVEN** the user is not authenticated
- **WHEN** executing `pr review 123 --approve`
- **THEN** an error "Authentication required" is displayed

#### Scenario: Invalid PR number for review
- **GIVEN** the user provides non-numeric input
- **WHEN** executing `pr review abc`
- **THEN** an error "Invalid PR number" is displayed

### Requirement: PR Comments Command
The system SHALL provide a `pr comments` command to list PR review comments.

#### Scenario: List PR comments
- **GIVEN** the user is in a repository directory
- **WHEN** executing `pr comments 123`
- **THEN** PR comments are listed with author, file, and body

#### Scenario: No comments on PR
- **GIVEN** the PR has no comments
- **WHEN** executing `pr comments 123`
- **THEN** a message "No comments found" is displayed

### Requirement: PR Comment Command
The system SHALL provide a `pr comment` command to add a general PR comment.

#### Scenario: Add PR comment
- **GIVEN** the user is authenticated
- **AND** the user is in a repository directory
- **WHEN** executing `pr comment 123 "Nice work!"`
- **THEN** a general comment is added to the PR
- **AND** a success message is displayed

#### Scenario: Comment requires authentication
- **GIVEN** the user is not authenticated
- **WHEN** executing `pr comment 123 "text"`
- **THEN** an error "Authentication required" is displayed

## MODIFIED Requirements

### Requirement: PR List Command
The system SHALL provide a `pr` command to list repository pull requests and support review operations.

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

#### Scenario: Show help with subcommands
- **GIVEN** the user executes `pr` without arguments
- **WHEN** the command runs
- **THEN** help text shows create, merge, close, review, comments, and comment subcommands
