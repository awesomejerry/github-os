## ADDED Requirements

### Requirement: Stage new file creation
The system SHALL allow staging a new file creation with path and content.

#### Scenario: Stage new file successfully
- **WHEN** user calls `stageCreate('/src/new.js', 'console.log("hello")')`
- **THEN** file is added to staging.creates with path as key and content in value

#### Scenario: Reject duplicate create
- **WHEN** user calls `stageCreate('/src/file.js', 'content')` and path already exists in creates
- **THEN** system throws Error with message "Path already staged for creation"

#### Scenario: Reject create when update exists
- **WHEN** user calls `stageCreate('/src/file.js', 'content')` and path already exists in updates
- **THEN** system throws Error with message "Path already staged for update"

### Requirement: Stage file update
The system SHALL allow staging a file update with path, content, and SHA.

#### Scenario: Stage update successfully
- **WHEN** user calls `stageUpdate('/src/file.js', 'new content', 'abc123')`
- **THEN** file is added to staging.updates with path as key and { content, sha } as value

#### Scenario: Reject update without SHA
- **WHEN** user calls `stageUpdate('/src/file.js', 'content', null)` or `stageUpdate('/src/file.js', 'content')`
- **THEN** system throws Error with message "SHA is required for updates"

#### Scenario: Reject update when delete exists
- **WHEN** user calls `stageUpdate('/src/file.js', 'content', 'abc123')` and path already exists in deletes
- **THEN** system throws Error with message "Path already staged for deletion"

#### Scenario: Allow multiple updates to same file
- **WHEN** user calls `stageUpdate('/src/file.js', 'content1', 'abc123')` then `stageUpdate('/src/file.js', 'content2', 'abc123')`
- **THEN** staging.updates contains the latest content

### Requirement: Stage file deletion
The system SHALL allow staging a file deletion with path and SHA.

#### Scenario: Stage delete successfully
- **WHEN** user calls `stageDelete('/src/old.js', 'abc123')`
- **THEN** file is added to staging.deletes with path as key and { sha } as value

#### Scenario: Reject delete without SHA
- **WHEN** user calls `stageDelete('/src/file.js', null)` or `stageDelete('/src/file.js')`
- **THEN** system throws Error with message "SHA is required for deletions"

#### Scenario: Remove create instead of delete
- **WHEN** user calls `stageDelete('/src/new.js', 'abc123')` and path exists in creates
- **THEN** entry is removed from creates instead of being added to deletes

#### Scenario: Delete staged update
- **WHEN** user calls `stageDelete('/src/file.js', 'abc123')` and path exists in updates but not creates
- **THEN** entry is added to deletes and removed from updates

### Requirement: Get staged changes
The system SHALL provide a function to retrieve all staged changes.

#### Scenario: Get empty staging area
- **WHEN** no files are staged and user calls `getStagedChanges()`
- **THEN** returns { creates: {}, updates: {}, deletes: {} }

#### Scenario: Get all staged changes
- **WHEN** files are staged in all categories and user calls `getStagedChanges()`
- **THEN** returns object with creates, updates, and deletes objects

### Requirement: Clear staging area
The system SHALL provide a function to clear all staged changes.

#### Scenario: Clear staging area
- **WHEN** user calls `clearStaging()`
- **THEN** all creates, updates, and deletes are removed from staging

### Requirement: Check if path is staged
The system SHALL provide a function to check if a specific path is staged.

#### Scenario: Check staged path in creates
- **WHEN** user calls `isStaged('/src/new.js')` and path exists in creates
- **THEN** returns true

#### Scenario: Check staged path in updates
- **WHEN** user calls `isStaged('/src/file.js')` and path exists in updates
- **THEN** returns true

#### Scenario: Check staged path in deletes
- **WHEN** user calls `isStaged('/src/old.js')` and path exists in deletes
- **THEN** returns true

#### Scenario: Check unstaged path
- **WHEN** user calls `isStaged('/src/unstaged.js')` and path is not in any category
- **THEN** returns false

### Requirement: Handle localStorage errors
The system SHALL handle localStorage errors gracefully.

#### Scenario: Handle JSON parse error
- **WHEN** localStorage contains invalid JSON and user calls `getStagedChanges()`
- **THEN** returns empty staging object { creates: {}, updates: {}, deletes: {} }

#### Scenario: Handle localStorage unavailable
- **WHEN** localStorage is not available (e.g., private browsing)
- **THEN** system throws Error with message "localStorage is not available"
