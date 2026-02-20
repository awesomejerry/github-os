## MODIFIED Requirements

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

#### Scenario: View issue details
- **GIVEN** the user is in a repository directory
- **WHEN** executing `issues view <number>`
- **THEN** issue details are displayed

#### Scenario: Create issue
- **GIVEN** the user is authenticated and in a repository directory
- **WHEN** executing `issues create [-t "title"] [-b "body"]`
- **THEN** a new issue is created

#### Scenario: Close issue
- **GIVEN** the user is authenticated and in a repository directory
- **WHEN** executing `issues close <number>` and confirming
- **THEN** the issue is closed

#### Scenario: Reopen issue
- **GIVEN** the user is authenticated and in a repository directory
- **WHEN** executing `issues reopen <number>` and confirming
- **THEN** the issue is reopened

#### Scenario: Comment on issue
- **GIVEN** the user is authenticated and in a repository directory
- **WHEN** executing `issues comment <number> "text"`
- **THEN** a comment is added to the issue

#### Scenario: No issues in repository
- **GIVEN** the user is in a repository directory
- **AND** the repository has no issues
- **WHEN** executing `issues`
- **THEN** a message "No open issues found" is displayed

#### Scenario: Not in a repository
- **GIVEN** the user is at root directory `/`
- **WHEN** executing `issues` or any issues subcommand
- **THEN** an error "Not in a repository" is displayed

#### Scenario: Pull requests are filtered out
- **GIVEN** the GitHub API returns both issues and pull requests
- **WHEN** executing `issues`
- **THEN** only issues are displayed (no pull requests)

#### Scenario: Rate limit handling
- **GIVEN** the GitHub API rate limit is exceeded
- **WHEN** executing `issues`
- **THEN** a rate limit error message is displayed

#### Scenario: Unknown subcommand
- **GIVEN** the user executes an unknown issues subcommand
- **WHEN** executing `issues unknown`
- **THEN** an error "Unknown issues command" is displayed
- **AND** available subcommands are listed (view, create, close, reopen, comment)
