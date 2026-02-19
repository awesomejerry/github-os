# Commands Delta Specification

## Purpose

Add commit, diff, and add commands for batch operations.

---

## ADDED Requirements

### Requirement: `add` - Stage Changes
The system SHALL provide an add command to stage file changes.

#### Scenario: Stage existing file
- **GIVEN** the user is in a repository
- **AND** a file exists at the specified path
- **WHEN** executing `add <file>`
- **THEN** the file is staged for commit
- **AND** a confirmation message is displayed

#### Scenario: Stage multiple files
- **GIVEN** the user is in a repository
- **WHEN** executing `add file1.txt file2.js file3.json`
- **THEN** all specified files are staged

#### Scenario: Stage all changes
- **GIVEN** the user has modified files
- **WHEN** executing `add .`
- **THEN** all changed files in current directory are staged

#### Scenario: File not found
- **GIVEN** a non-existent file path
- **WHEN** executing `add <nonexistent>`
- **THEN** an error "File not found" is displayed

#### Scenario: Not in repository
- **GIVEN** the user is at root (/)
- **WHEN** executing `add`
- **THEN** an error "Not in a repository" is displayed

#### Scenario: Authentication required
- **GIVEN** the user is not logged in
- **WHEN** executing `add`
- **THEN** an error "Authentication required" is displayed

### Requirement: `diff` - Show Staged Changes
The system SHALL provide a diff command to display staged changes.

#### Scenario: Show staged diff
- **GIVEN** files are staged
- **WHEN** executing `diff`
- **THEN** a unified diff is displayed for each staged file
- **AND** additions are shown with + prefix
- **AND** deletions are shown with - prefix

#### Scenario: Show statistics
- **GIVEN** files are staged
- **WHEN** executing `diff`
- **THEN** summary shows: files changed, insertions, deletions

#### Scenario: No staged changes
- **GIVEN** no files are staged
- **WHEN** executing `diff`
- **THEN** "No staged changes" is displayed

#### Scenario: New file diff
- **GIVEN** a new file is staged
- **WHEN** executing `diff`
- **THEN** all lines are shown as additions (+)
- **AND** header indicates "new file"

#### Scenario: Deleted file diff
- **GIVEN** a file deletion is staged
- **WHEN** executing `diff`
- **THEN** all lines are shown as deletions (-)
- **AND** header indicates "deleted"

### Requirement: `commit` - Batch Commit
The system SHALL provide a commit command with -m flag support.

#### Scenario: Commit with message
- **GIVEN** files are staged and user is logged in
- **WHEN** executing `commit -m "Add feature X"`
- **THEN** all staged changes are committed in one commit
- **AND** staging area is cleared
- **AND** commit SHA and statistics are displayed

#### Scenario: No message provided
- **GIVEN** files are staged
- **WHEN** executing `commit` without -m
- **THEN** an error "Usage: commit -m \"message\"" is displayed

#### Scenario: No staged changes
- **GIVEN** no files are staged
- **WHEN** executing `commit -m "message"`
- **THEN** "No staged changes to commit" is displayed

#### Scenario: Authentication required
- **GIVEN** the user is not logged in
- **WHEN** executing `commit -m "message"`
- **THEN** an error "Authentication required" is displayed

#### Scenario: Not in repository
- **GIVEN** the user is at root (/)
- **WHEN** executing `commit -m "message"`
- **THEN** an error "Not in a repository" is displayed

#### Scenario: Commit success display
- **GIVEN** a successful commit
- **WHEN** the commit completes
- **THEN** output shows:
  - Commit SHA (7 chars)
  - Branch name
  - Files changed count
  - Insertions count
  - Deletions count

### Requirement: `status` - Show Staging Status
The system SHALL extend status command to show staged changes.

#### Scenario: Show staged files in status
- **GIVEN** files are staged
- **WHEN** executing `status`
- **THEN** authentication status is shown
- **AND** rate limit is shown
- **AND** staged changes summary is shown:
  - Files to be committed
  - New files marked as "new file"
  - Modified files marked as "modified"
  - Deleted files marked as "deleted"
