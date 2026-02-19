# batch-commit Specification

## Purpose
TBD - created by archiving change batch-commit. Update Purpose after archive.
## Requirements
### Requirement: Batch Commit API
The system SHALL support committing multiple file changes in a single atomic operation.

#### Scenario: Create multiple files in one commit
- **GIVEN** the user has staged multiple file creates
- **WHEN** executing batch commit with message
- **THEN** all files are created in a single commit
- **AND** the commit SHA is returned
- **AND** statistics show files created count

#### Scenario: Mixed operations in one commit
- **GIVEN** the user has staged creates, updates, and deletes
- **WHEN** executing batch commit with message
- **THEN** all operations are applied atomically
- **AND** a single commit SHA is returned
- **AND** statistics show breakdown by operation type

#### Scenario: Empty staging area
- **GIVEN** no changes are staged
- **WHEN** executing batch commit
- **THEN** an error "No staged changes" is raised

#### Scenario: Authentication required
- **GIVEN** the user is not logged in
- **WHEN** executing batch commit
- **THEN** an error "Authentication required" is raised

### Requirement: Git Data API Integration
The system SHALL use GitHub Git Data API for batch commits.

#### Scenario: Successful commit flow
- **GIVEN** the user is authenticated and has staged changes
- **WHEN** executing batch commit
- **THEN** the system performs the following API calls:
  1. GET ref to get base commit SHA
  2. GET commit to get base tree SHA
  3. POST tree with all changes
  4. POST commit with message
  5. PATCH ref to point to new commit

#### Scenario: Concurrent modification conflict
- **GIVEN** the remote branch was modified after getting base tree
- **WHEN** attempting to update the ref
- **THEN** GitHub returns a conflict error
- **AND** the system displays an error suggesting retry

### Requirement: Tree Entry Construction
The system SHALL construct proper tree entries for all change types.

#### Scenario: Create file tree entry
- **GIVEN** staging a new file creation
- **WHEN** building tree entry
- **THEN** entry includes: path, mode=100644, type=blob, content (base64 encoded)

#### Scenario: Update file tree entry
- **GIVEN** staging a file update
- **WHEN** building tree entry
- **THEN** entry includes: path, mode=100644, type=blob, content (base64 encoded)
- **AND** the new content replaces existing in the tree

#### Scenario: Delete file tree entry
- **GIVEN** staging a file deletion
- **WHEN** building tree entry
- **THEN** entry includes: path, mode=100644, type=blob, sha=null

### Requirement: Commit Statistics
The system SHALL provide summary statistics after batch commit.

#### Scenario: Display commit summary
- **GIVEN** a successful batch commit
- **WHEN** the operation completes
- **THEN** statistics displayed include:
  - Commit SHA (short form)
  - Number of files created
  - Number of files updated
  - Number of files deleted
  - Total changes

### Requirement: Branch Support
The system SHALL support batch commits on any branch.

#### Scenario: Commit to current branch
- **GIVEN** the user is on a specific branch
- **WHEN** executing batch commit
- **THEN** the commit is created on the current branch

#### Scenario: Commit on default branch
- **GIVEN** no specific branch is checked out
- **WHEN** executing batch commit
- **THEN** the commit is created on the repository's default branch

