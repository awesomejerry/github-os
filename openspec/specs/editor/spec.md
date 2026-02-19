# Editor Specification

## Purpose

Built-in modal editor for editing files in the terminal.

---

## Requirements

### Requirement: Open editor modal
The system SHALL display a modal editor for editing files.

#### Scenario: Open file for editing
- GIVEN the user is in a repository
- AND the file "config.json" exists
- WHEN executing `edit config.json`
- THEN an editor modal is displayed
- AND the file content is loaded
- AND the filename is shown in the header

#### Scenario: File not found
- GIVEN the user is in a repository
- AND the file "nonexistent.txt" does not exist
- WHEN executing `edit nonexistent.txt`
- THEN an error "File not found" is displayed

#### Scenario: Not in repository
- GIVEN the user is at root (`/`)
- WHEN executing `edit file.txt`
- THEN an error "Not in a repository" is displayed

---

### Requirement: Save changes
The system SHALL allow saving edited content.

#### Scenario: Save file with Ctrl+S
- GIVEN the editor is open with a file
- WHEN pressing Ctrl+S
- THEN the content is staged for commit
- AND the modal is closed
- AND a "Staged: modified" message is displayed

#### Scenario: Cancel editing with ESC
- GIVEN the editor is open with a file
- AND the user has made changes
- WHEN pressing ESC
- THEN the modal is closed
- AND no changes are staged

---

### Requirement: Authentication required
The system SHALL require authentication for editing.

#### Scenario: Not logged in
- GIVEN the user is not logged in
- WHEN executing `edit file.txt`
- THEN an error "Login required" is displayed

---

## Files

- `scripts/editor.js` - Editor implementation
- `scripts/commands.js` - cmdEdit
- `styles/main.css` - Editor styles

## Status

✅ Implemented in v2.1.0
✅ Updated for staging in v2.2.0
