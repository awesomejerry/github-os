## ADDED Requirements

### Requirement: Staging Area Management
The system SHALL provide a staging area for file changes before committing to GitHub.

#### Scenario: Stage new file
- **GIVEN** user creates a new file with `touch`
- **WHEN** the command executes
- **THEN** the file is staged (not committed)
- **AND** output shows `Staged: new file <path>`

#### Scenario: Stage directory creation
- **GIVEN** user creates a directory with `mkdir`
- **WHEN** the command executes
- **THEN** a `.gitkeep` file is staged in the directory
- **AND** output shows `Staged: new directory <dir>/`

#### Scenario: Stage file deletion
- **GIVEN** user deletes a file with `rm`
- **WHEN** the command executes
- **THEN** the deletion is staged (not committed)
- **AND** output shows `Staged: deleted <path>`

#### Scenario: Stage file move
- **GIVEN** user moves a file with `mv`
- **WHEN** the command executes
- **THEN** source deletion and destination creation are staged
- **AND** output shows `Staged: moved <src> → <dest>`

#### Scenario: Stage file copy
- **GIVEN** user copies a file with `cp`
- **WHEN** the command executes
- **THEN** the copy is staged (not committed)
- **AND** output shows `Staged: copied <src> → <dest>`

#### Scenario: Stage file modification
- **GIVEN** user edits a file with `edit` and saves
- **WHEN** the editor saves
- **THEN** the modification is staged (not committed)
- **AND** output shows `Staged: modified <path>`

### Requirement: View Staged Changes
The system SHALL display staged changes in the `status` command.

#### Scenario: Show staged changes
- **GIVEN** user has staged changes
- **WHEN** executing `status`
- **THEN** auth status is displayed (existing behavior)
- **AND** staged changes are listed with type indicator:
  - `+` for new files
  - `~` for modified files
  - `-` for deleted files

#### Scenario: No staged changes
- **GIVEN** user has no staged changes
- **WHEN** executing `status`
- **THEN** output shows `(no staged changes)`

### Requirement: Unstage Changes
The system SHALL allow removing changes from the staging area.

#### Scenario: Unstage specific file
- **GIVEN** user has staged changes
- **WHEN** executing `unstage <path>`
- **THEN** that file is removed from staging
- **AND** output shows `Unstaged: <path>`

#### Scenario: Unstage all changes
- **GIVEN** user has staged changes
- **WHEN** executing `unstage --all`
- **THEN** all changes are removed from staging
- **AND** output shows `Cleared staging area`

#### Scenario: Unstage non-staged file
- **GIVEN** user executes `unstage <path>` for file not staged
- **WHEN** the command runs
- **THEN** output shows `Not staged: <path>`

### Requirement: Commit Staged Changes
The system SHALL commit all staged changes at once.

#### Scenario: Commit with message
- **GIVEN** user has staged changes
- **WHEN** executing `commit -m "message"`
- **THEN** all staged changes are committed to GitHub
- **AND** output shows commit SHA and file count
- **AND** staging area is cleared

#### Scenario: Commit without message
- **GIVEN** user executes `commit` without `-m`
- **WHEN** the command runs
- **THEN** output shows `Usage: commit -m "message"`

#### Scenario: Commit with no staged changes
- **GIVEN** user has no staged changes
- **WHEN** executing `commit -m "message"`
- **THEN** output shows `Nothing to commit`
