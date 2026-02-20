## ADDED Requirements

### Requirement: fetchIssue Function
The system SHALL provide a function to fetch a single issue's details.

#### Scenario: Fetch issue successfully
- **GIVEN** valid owner, repo, and issue number
- **WHEN** calling fetchIssue(owner, repo, number)
- **THEN** issue data is returned including: number, title, body, state, author, labels, created_at, html_url

#### Scenario: Issue not found
- **GIVEN** a non-existent issue number
- **WHEN** calling fetchIssue
- **THEN** an error "Issue not found" is raised

---

### Requirement: createIssue Function
The system SHALL provide a function to create new issues via GitHub API.

#### Scenario: Create issue successfully
- **GIVEN** valid authentication token
- **AND** valid owner, repo, title, and body
- **WHEN** calling createIssue(owner, repo, title, body)
- **THEN** a POST request is sent to `/repos/{owner}/{repo}/issues`
- **AND** the new issue number and URL are returned

#### Scenario: Authentication required
- **GIVEN** no valid authentication
- **WHEN** calling createIssue
- **THEN** an error "Authentication required" is raised

#### Scenario: Permission denied
- **GIVEN** user lacks write access to repository
- **WHEN** calling createIssue
- **THEN** an error "Permission denied" is raised

---

### Requirement: updateIssue Function
The system SHALL provide a function to update issue state via GitHub API.

#### Scenario: Update issue state
- **GIVEN** valid authentication token
- **AND** valid owner, repo, issue number, and state ("open" or "closed")
- **WHEN** calling updateIssue(owner, repo, number, state)
- **THEN** a PATCH request is sent to `/repos/{owner}/{repo}/issues/{number}`
- **AND** the updated issue data is returned

#### Scenario: Authentication required
- **GIVEN** no valid authentication
- **WHEN** calling updateIssue
- **THEN** an error "Authentication required" is raised

---

### Requirement: addIssueComment Function
The system SHALL provide a function to add comments to issues via GitHub API.

#### Scenario: Add comment successfully
- **GIVEN** valid authentication token
- **AND** valid owner, repo, issue number, and comment body
- **WHEN** calling addIssueComment(owner, repo, number, body)
- **THEN** a POST request is sent to `/repos/{owner}/{repo}/issues/{number}/comments`
- **AND** the comment URL is returned

#### Scenario: Authentication required
- **GIVEN** no valid authentication
- **WHEN** calling addIssueComment
- **THEN** an error "Authentication required" is raised
