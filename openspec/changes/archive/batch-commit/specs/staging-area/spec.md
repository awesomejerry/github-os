# Staging Area Specification

## Purpose

Provide a staging area for tracking pending file changes before batch commit.

---

## ADDED Requirements

### Requirement: Stage File Creation
The system SHALL support staging new file creations.

#### Scenario: Stage new file
- **GIVEN** a file path and content
- **WHEN** calling stageCreate(path, content)
- **THEN** the change is stored in staging area with type 'create'
- **AND** the staging area persists across page refreshes

#### Scenario: Overwrite existing staged create
- **GIVEN** a file is already staged for creation
- **WHEN** staging the same file again with new content
- **THEN** the staged content is updated
- **AND** only one entry exists for that path

### Requirement: Stage File Update
The system SHALL support staging file modifications.

#### Scenario: Stage file update
- **GIVEN** a file path, new content, and original SHA
- **WHEN** calling stageUpdate(path, content, sha)
- **THEN** the change is stored with type 'update' and original SHA

#### Scenario: Promote create to update
- **GIVEN** a file was staged for creation
- **WHEN** staging an update for the same path
- **THEN** the type remains 'create' with updated content
- **AND** no SHA is required

### Requirement: Stage File Deletion
The system SHALL support staging file deletions.

#### Scenario: Stage file delete
- **GIVEN** a file path and its SHA
- **WHEN** calling stageDelete(path, sha)
- **THEN** the change is stored with type 'delete' and SHA

#### Scenario: Cancel staged create with delete
- **GIVEN** a file was staged for creation
- **WHEN** staging a delete for the same path
- **THEN** the entry is removed entirely (no net change)

### Requirement: Unstage Changes
The system SHALL support removing individual changes from staging.

#### Scenario: Unstage specific file
- **GIVEN** multiple files are staged
- **WHEN** calling unstage(path)
- **THEN** only that file's change is removed
- **AND** other staged changes remain

#### Scenario: Unstage non-existent path
- **GIVEN** a path not in staging area
- **WHEN** calling unstage(path)
- **THEN** no error is raised
- **AND** staging area is unchanged

### Requirement: Get Staged Changes
The system SHALL provide access to all staged changes.

#### Scenario: Retrieve all staged changes
- **GIVEN** multiple changes are staged
- **WHEN** calling getStagedChanges()
- **THEN** an object is returned with arrays:
  - creates: [{ path, content }]
  - updates: [{ path, content, sha }]
  - deletes: [{ path, sha }]

#### Scenario: Empty staging area
- **GIVEN** no changes are staged
- **WHEN** calling getStagedChanges()
- **THEN** empty arrays are returned for creates, updates, deletes

### Requirement: Clear Staging Area
The system SHALL support clearing all staged changes.

#### Scenario: Clear after commit
- **GIVEN** changes are staged
- **WHEN** calling clearStaging()
- **THEN** all staged changes are removed
- **AND** subsequent getStagedChanges() returns empty arrays

#### Scenario: Automatic clear on commit
- **GIVEN** a successful batch commit
- **WHEN** the commit completes
- **THEN** the staging area is automatically cleared

### Requirement: Check for Staged Changes
The system SHALL support checking if changes exist.

#### Scenario: Has staged changes
- **GIVEN** any changes are staged
- **WHEN** calling hasStagedChanges()
- **THEN** true is returned

#### Scenario: No staged changes
- **GIVEN** the staging area is empty
- **WHEN** calling hasStagedChanges()
- **THEN** false is returned

### Requirement: Persistence
The system SHALL persist staging data in localStorage.

#### Scenario: Persist across sessions
- **GIVEN** changes are staged
- **WHEN** the page is refreshed
- **THEN** all staged changes are preserved

#### Scenario: Storage key format
- **GIVEN** the staging system
- **WHEN** storing data
- **THEN** localStorage key is 'github_os_staging'
- **AND** value is JSON stringified staging object
