# file-operations Specification

## Purpose
TBD - created by archiving change file-operations. Update Purpose after archive.
## Requirements
### Requirement: `touch` - Create New File
The system SHALL allow authenticated users to create new files.

#### Scenario: Create new file successfully
- **GIVEN** the user is authenticated
- **AND** the user is in a repository
- **WHEN** executing `touch <file>`
- **THEN** a new empty file is created at the specified path
- **AND** the commit SHA is displayed
- **AND** commit message is "Create {filename}"

#### Scenario: File already exists
- **GIVEN** the user is authenticated
- **AND** the file already exists
- **WHEN** executing `touch <file>`
- **THEN** no changes are made
- **AND** a message indicates the file already exists

#### Scenario: Not authenticated
- **GIVEN** the user is not logged in
- **WHEN** executing `touch <file>`
- **THEN** an error "Authentication required. Use 'login' to connect." is displayed

#### Scenario: Not in a repository
- **GIVEN** the user is at root (`/`)
- **WHEN** executing `touch <file>`
- **THEN** an error "Not in a repository" is displayed

---

### Requirement: `mkdir` - Create Directory
The system SHALL allow authenticated users to create directories.

#### Scenario: Create directory successfully
- **GIVEN** the user is authenticated
- **AND** the user is in a repository
- **WHEN** executing `mkdir <dir>`
- **THEN** a `.gitkeep` file is created inside the directory
- **AND** the commit SHA is displayed
- **AND** commit message is "Create directory {dir}"

#### Scenario: Directory already exists
- **GIVEN** the user is authenticated
- **AND** the directory already exists
- **WHEN** executing `mkdir <dir>`
- **THEN** an error "Directory already exists" is displayed

#### Scenario: Not authenticated
- **GIVEN** the user is not logged in
- **WHEN** executing `mkdir <dir>`
- **THEN** an error "Authentication required" is displayed

---

### Requirement: `rm` - Delete File
The system SHALL allow authenticated users to delete files with confirmation.

#### Scenario: Delete file with confirmation
- **GIVEN** the user is authenticated
- **AND** the user is in a repository
- **WHEN** executing `rm <file>`
- **THEN** a warning is displayed asking for confirmation
- **AND** when user types 'yes'
- **THEN** the file is deleted
- **AND** the commit SHA is displayed
- **AND** commit message is "Delete {filename}"

#### Scenario: Delete cancelled
- **GIVEN** the user is authenticated
- **WHEN** executing `rm <file>`
- **AND** user types anything other than 'yes'
- **THEN** the operation is cancelled
- **AND** "Operation cancelled" is displayed

#### Scenario: File not found
- **GIVEN** the file does not exist
- **WHEN** executing `rm <file>`
- **THEN** an error "File not found" is displayed

#### Scenario: Not authenticated
- **GIVEN** the user is not logged in
- **WHEN** executing `rm <file>`
- **THEN** an error "Authentication required" is displayed

---

### Requirement: `mv` - Move/Rename File
The system SHALL allow authenticated users to move or rename files.

#### Scenario: Move file successfully
- **GIVEN** the user is authenticated
- **AND** source file exists
- **WHEN** executing `mv <src> <dest>`
- **THEN** the file content is copied to destination
- **AND** the source file is deleted
- **AND** the commit SHA is displayed
- **AND** commit message is "Move {src} to {dest}"

#### Scenario: Source file not found
- **GIVEN** the source file does not exist
- **WHEN** executing `mv <src> <dest>`
- **THEN** an error "File not found: {src}" is displayed

#### Scenario: Destination already exists
- **GIVEN** the destination file already exists
- **WHEN** executing `mv <src> <dest>`
- **THEN** an error "Destination already exists: {dest}" is displayed

#### Scenario: Not authenticated
- **GIVEN** the user is not logged in
- **WHEN** executing `mv <src> <dest>`
- **THEN** an error "Authentication required" is displayed

---

### Requirement: `cp` - Copy File
The system SHALL allow authenticated users to copy files.

#### Scenario: Copy file successfully
- **GIVEN** the user is authenticated
- **AND** source file exists
- **WHEN** executing `cp <src> <dest>`
- **THEN** a copy of the file is created at destination
- **AND** the commit SHA is displayed
- **AND** commit message is "Copy {src} to {dest}"

#### Scenario: Source file not found
- **GIVEN** the source file does not exist
- **WHEN** executing `cp <src> <dest>`
- **THEN** an error "File not found: {src}" is displayed

#### Scenario: Destination already exists
- **GIVEN** the destination file already exists
- **WHEN** executing `cp <src> <dest>`
- **THEN** an error "Destination already exists: {dest}" is displayed

#### Scenario: Not authenticated
- **GIVEN** the user is not logged in
- **WHEN** executing `cp <src> <dest>`
- **THEN** an error "Authentication required" is displayed

