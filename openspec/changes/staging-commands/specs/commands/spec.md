## MODIFIED Requirements

### Requirement: `touch` - Create File
The system SHALL create new files in the staging area.

#### Scenario: Create new file
- **GIVEN** the user is authenticated and in a repository
- **WHEN** executing `touch <file>`
- **AND** the file does not exist
- **THEN** the file is staged for creation
- **AND** output shows `Staged: new file <file>`

#### Scenario: File already exists
- **GIVEN** the file already exists
- **WHEN** executing `touch <file>`
- **THEN** output shows `File already exists: <file>`

### Requirement: `mkdir` - Create Directory
The system SHALL create directories in the staging area.

#### Scenario: Create directory
- **GIVEN** the user is authenticated and in a repository
- **WHEN** executing `mkdir <dir>`
- **THEN** a `.gitkeep` file is staged in the directory
- **AND** output shows `Staged: new directory <dir>/`

#### Scenario: Directory already exists
- **GIVEN** the directory already exists
- **WHEN** executing `mkdir <dir>`
- **THEN** output shows `Directory already exists: <dir>`

### Requirement: `rm` - Delete File
The system SHALL stage file deletions.

#### Scenario: Delete with confirmation
- **GIVEN** the user is authenticated and in a repository
- **WHEN** executing `rm <file>`
- **THEN** a warning is displayed
- **AND** user is prompted for confirmation
- **AND** if confirmed, deletion is staged
- **AND** output shows `Staged: deleted <file>`

#### Scenario: Cancel deletion
- **GIVEN** user is prompted for confirmation
- **WHEN** user types anything other than 'yes'
- **THEN** output shows `Operation cancelled`

### Requirement: `mv` - Move File
The system SHALL stage file moves.

#### Scenario: Move file
- **GIVEN** the user is authenticated and in a repository
- **WHEN** executing `mv <src> <dest>`
- **AND** source file exists
- **AND** destination does not exist
- **THEN** source deletion is staged
- **AND** destination creation is staged
- **AND** output shows `Staged: moved <src> → <dest>`

#### Scenario: Destination exists
- **GIVEN** destination file exists
- **WHEN** executing `mv <src> <dest>`
- **THEN** output shows `Destination already exists: <dest>`

### Requirement: `cp` - Copy File
The system SHALL stage file copies.

#### Scenario: Copy file
- **GIVEN** the user is authenticated and in a repository
- **WHEN** executing `cp <src> <dest>`
- **AND** source file exists
- **AND** destination does not exist
- **THEN** destination creation is staged
- **AND** output shows `Staged: copied <src> → <dest>`

### Requirement: `edit` - Edit File
The system SHALL stage file modifications.

#### Scenario: Edit and save
- **GIVEN** the user is authenticated and in a repository
- **WHEN** executing `edit <file>`
- **AND** user modifies content and saves
- **THEN** modification is staged
- **AND** output shows `Staged: modified <file>`

#### Scenario: Edit and cancel
- **GIVEN** user is in editor
- **WHEN** user cancels without saving
- **THEN** no change is staged

### Requirement: `status` - Show Status
The system SHALL display authentication status and staged changes.

#### Scenario: Show full status
- **GIVEN** user is logged in
- **WHEN** executing `status`
- **THEN** authentication info is displayed (existing behavior)
- **AND** staged changes are listed with indicators:
  - `+` for create
  - `~` for update
  - `-` for delete

#### Scenario: Not logged in
- **GIVEN** user is not logged in
- **WHEN** executing `status`
- **THEN** output shows `Not logged in. Use 'login' to connect.`

## ADDED Requirements

### Requirement: `unstage` - Remove from Staging
The system SHALL allow removing changes from staging area.

#### Scenario: Unstage file
- **GIVEN** user has staged changes
- **WHEN** executing `unstage <path>`
- **THEN** that file is removed from staging
- **AND** output shows `Unstaged: <path>`

#### Scenario: Unstage all
- **GIVEN** user has staged changes
- **WHEN** executing `unstage --all`
- **THEN** staging area is cleared
- **AND** output shows `Cleared staging area (N changes)`

### Requirement: `commit` - Commit Staged Changes
The system SHALL commit all staged changes to GitHub.

#### Scenario: Commit staged changes
- **GIVEN** user has staged changes
- **WHEN** executing `commit -m "<message>"`
- **THEN** all staged changes are committed
- **AND** output shows commit SHA
- **AND** output shows number of files changed
- **AND** staging area is cleared

#### Scenario: Nothing to commit
- **GIVEN** user has no staged changes
- **WHEN** executing `commit -m "<message>"`
- **THEN** output shows `Nothing to commit`
