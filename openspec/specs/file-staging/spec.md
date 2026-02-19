# File Staging Specification

## Purpose

Stage file changes before batch commit.

---

## Requirements

### Requirement: Stage new file
The system SHALL allow staging new file creation.

#### Scenario: Stage new file
- GIVEN a file does not exist
- WHEN executing `touch newfile.txt`
- THEN the file is added to staging.creates
- AND a "Staged: new file" message is displayed

---

### Requirement: Stage file modification
The system SHALL allow staging file updates.

#### Scenario: Stage file update
- GIVEN a file exists with SHA "abc123"
- WHEN executing `edit file.txt` and saving
- THEN the file is added to staging.updates with SHA
- AND a "Staged: modified" message is displayed

---

### Requirement: Stage file deletion
The system SHALL allow staging file deletion.

#### Scenario: Stage file deletion
- GIVEN a file exists with SHA "abc123"
- WHEN executing `rm file.txt` and confirming
- THEN the file is added to staging.deletes with SHA
- AND a "Staged: deleted" message is displayed

---

### Requirement: Query staged changes
The system SHALL allow querying staged changes.

#### Scenario: Show staged changes in status
- GIVEN there are staged changes
- WHEN executing `status`
- THEN all staged creates, updates, deletes are listed
- AND the count of changes is displayed

---

### Requirement: Clear staging
The system SHALL allow clearing staged changes.

#### Scenario: Clear all staged changes
- GIVEN there are staged changes
- WHEN executing `unstage --all`
- THEN the staging area is cleared
- AND no changes are displayed in status

#### Scenario: Unstage single file
- GIVEN file "config.js" is staged
- WHEN executing `unstage config.js`
- THEN the file is removed from staging
- AND an "Unstaged: config.js" message is displayed

#### Scenario: Unstage non-staged file
- GIVEN file "notstaged.js" is not staged
- WHEN executing `unstage notstaged.js`
- THEN an error "File not staged" is displayed

---

## Files

- `scripts/staging.js` - Staging implementation

## Status

✅ Implemented in v2.2.0
