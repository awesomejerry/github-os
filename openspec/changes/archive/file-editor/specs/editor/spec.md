## ADDED Requirements

### Requirement: User can open file editor
The system SHALL allow authenticated users to open a file editor from the terminal command line.

#### Scenario: Open editor with valid file path
- **WHEN** user runs `edit <file>` command while in a repository directory
- **THEN** system checks authentication status
- **AND** system loads the file content from GitHub API
- **AND** system displays editor modal with file content in textarea
- **AND** system shows file name in modal header

#### Scenario: Open editor without authentication
- **WHEN** user runs `edit <file>` command while not logged in
- **THEN** system displays error message "Login required. Use 'login' to connect."
- **AND** editor modal does not open

#### Scenario: Open editor for non-existent file
- **WHEN** user runs `edit <file>` for a file that does not exist
- **THEN** system displays error message "File not found"
- **AND** editor modal does not open

#### Scenario: Open editor from root directory
- **WHEN** user runs `edit <file>` from the root directory (not in a repo)
- **THEN** system displays error message "Not in a repository. Use 'cd' to enter a repo first."

### Requirement: Editor modal displays file content
The system SHALL display file content in a modal overlay with editing capabilities.

#### Scenario: Modal shows file name
- **WHEN** editor modal opens
- **THEN** system displays the file path in the modal header

#### Scenario: Modal has large textarea
- **WHEN** editor modal opens
- **THEN** system displays a textarea that fills most of the screen
- **AND** textarea contains the file content

#### Scenario: Modal has action buttons
- **WHEN** editor modal opens
- **THEN** system displays "Save" button
- **AND** system displays "Cancel" button

### Requirement: User can cancel editing
The system SHALL allow users to cancel editing without saving changes.

#### Scenario: Cancel via button
- **WHEN** user clicks "Cancel" button
- **THEN** system closes the modal
- **AND** no changes are made to the file
- **AND** terminal shows no success message

#### Scenario: Cancel via ESC key
- **WHEN** user presses ESC key while editor is open
- **THEN** system closes the modal
- **AND** no changes are made to the file

### Requirement: User can save changes
The system SHALL allow authenticated users to save edited content to GitHub.

#### Scenario: Save via button
- **WHEN** user clicks "Save" button
- **THEN** system encodes content as Base64
- **AND** system calls GitHub API PUT /repos/{owner}/{repo}/contents/{path}
- **AND** system closes the modal
- **AND** system displays success message

#### Scenario: Save via Ctrl+S
- **WHEN** user presses Ctrl+S while editor is open
- **THEN** system saves the file (same as clicking Save button)

#### Scenario: Save fails due to conflict
- **WHEN** user saves but file SHA has changed (concurrent edit)
- **THEN** system displays error message about conflict
- **AND** modal remains open with edited content

#### Scenario: Save fails due to network error
- **WHEN** user saves but GitHub API is unreachable
- **THEN** system displays error message
- **AND** modal remains open with edited content

### Requirement: Editor closes and returns focus
The system SHALL properly close the editor and return control to the terminal.

#### Scenario: After successful save
- **WHEN** save operation completes successfully
- **THEN** system removes modal from DOM
- **AND** system returns focus to terminal input

#### Scenario: After cancel
- **WHEN** user cancels editing
- **THEN** system removes modal from DOM
- **AND** system returns focus to terminal input
