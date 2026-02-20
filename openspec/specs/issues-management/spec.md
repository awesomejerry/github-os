# issues-management Specification

## Purpose

Provides comprehensive issue management capabilities including view, create, close, reopen, and comment operations.

---
## Requirements

### Requirement: Issue View Command
The system SHALL provide an `issues view` subcommand to display issue details.

#### Scenario: View issue details
- **GIVEN** the user is in a repository directory
- **WHEN** executing `issues view <number>`
- **THEN** issue details are displayed including: number, title, author, state, body, labels, created date, and URL

#### Scenario: Issue not found
- **GIVEN** the user is in a repository directory
- **WHEN** executing `issues view <number>` with invalid number
- **THEN** an error "Issue not found" is displayed

#### Scenario: Not in a repository
- **GIVEN** the user is at root directory `/`
- **WHEN** executing `issues view <number>`
- **THEN** an error "Not in a repository" is displayed

---

### Requirement: Issue Create Command
The system SHALL provide an `issues create` subcommand to create new issues.

#### Scenario: Create issue with flags
- **GIVEN** the user is authenticated
- **AND** the user is in a repository directory
- **WHEN** executing `issues create -t "title" -b "body"`
- **THEN** a new issue is created
- **AND** the issue number and URL are displayed

#### Scenario: Create issue interactive mode
- **GIVEN** the user is authenticated
- **AND** the user is in a repository directory
- **WHEN** executing `issues create` without flags
- **THEN** the user is prompted for title
- **AND** then prompted for body
- **AND** a new issue is created

#### Scenario: Create requires authentication
- **GIVEN** the user is not authenticated
- **WHEN** executing `issues create`
- **THEN** an error "Authentication required" is displayed

#### Scenario: Title is required
- **GIVEN** the user is authenticated
- **WHEN** creating an issue with empty title
- **THEN** an error "Issue title is required" is displayed

---

### Requirement: Issue Close Command
The system SHALL provide an `issues close` subcommand to close open issues.

#### Scenario: Close issue with confirmation
- **GIVEN** the user is authenticated
- **AND** the user is in a repository directory
- **WHEN** executing `issues close <number>`
- **THEN** a confirmation prompt is shown
- **AND** typing "yes" closes the issue

#### Scenario: Close cancelled
- **GIVEN** the user is authenticated
- **WHEN** executing `issues close <number>` and typing anything other than "yes"
- **THEN** the operation is cancelled

#### Scenario: Close requires authentication
- **GIVEN** the user is not authenticated
- **WHEN** executing `issues close <number>`
- **THEN** an error "Authentication required" is displayed

---

### Requirement: Issue Reopen Command
The system SHALL provide an `issues reopen` subcommand to reopen closed issues.

#### Scenario: Reopen issue with confirmation
- **GIVEN** the user is authenticated
- **AND** the user is in a repository directory
- **WHEN** executing `issues reopen <number>`
- **THEN** a confirmation prompt is shown
- **AND** typing "yes" reopens the issue

#### Scenario: Reopen requires authentication
- **GIVEN** the user is not authenticated
- **WHEN** executing `issues reopen <number>`
- **THEN** an error "Authentication required" is displayed

---

### Requirement: Issue Comment Command
The system SHALL provide an `issues comment` subcommand to add comments to issues.

#### Scenario: Add comment to issue
- **GIVEN** the user is authenticated
- **AND** the user is in a repository directory
- **WHEN** executing `issues comment <number> "comment text"`
- **THEN** the comment is added to the issue
- **AND** a success message is displayed

#### Scenario: Comment requires authentication
- **GIVEN** the user is not authenticated
- **WHEN** executing `issues comment <number> "text"`
- **THEN** an error "Authentication required" is displayed

#### Scenario: Comment text required
- **GIVEN** the user is authenticated
- **WHEN** executing `issues comment <number>` without text
- **THEN** an error "Comment text is required" is displayed

---

### Requirement: Issue API Functions
The system SHALL provide GitHub API functions for issue operations.

#### Scenario: fetchIssue function
- **GIVEN** valid owner, repo, and issue number
- **WHEN** calling fetchIssue(owner, repo, number)
- **THEN** issue data is returned including: number, title, body, state, author, labels, created_at, html_url

#### Scenario: createIssue function
- **GIVEN** valid authentication and parameters
- **WHEN** calling createIssue(owner, repo, title, body)
- **THEN** a POST request is sent to `/repos/{owner}/{repo}/issues`
- **AND** the new issue number and URL are returned

#### Scenario: updateIssue function
- **GIVEN** valid authentication and parameters
- **WHEN** calling updateIssue(owner, repo, number, state)
- **THEN** a PATCH request is sent to `/repos/{owner}/{repo}/issues/{number}`
- **AND** the updated issue data is returned

#### Scenario: addIssueComment function
- **GIVEN** valid authentication and parameters
- **WHEN** calling addIssueComment(owner, repo, number, body)
- **THEN** a POST request is sent to `/repos/{owner}/{repo}/issues/{number}/comments`
- **AND** the comment URL is returned
