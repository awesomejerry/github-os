# Commands Specification

## Purpose

GitHub OS provides a set of terminal commands for navigating and exploring GitHub repositories.

---

## Navigation Commands

### Requirement: `ls` - List Contents
The system SHALL list directory contents.

#### Scenario: List root directory
- GIVEN the user is at root (`/`)
- WHEN executing `ls`
- THEN all public repositories are listed
- AND each repo shows language, star count, and description

#### Scenario: List repository contents
- GIVEN the user is inside a repository
- WHEN executing `ls`
- THEN files and directories are listed
- AND directories have trailing `/`
- AND files show their size

#### Scenario: List with path argument
- GIVEN the user provides a path
- WHEN executing `ls <path>`
- THEN the contents of that path are listed

---

### Requirement: `cd` - Change Directory
The system SHALL allow changing the current directory.

#### Scenario: Change to repository
- GIVEN the user is at root
- WHEN executing `cd <repo-name>`
- THEN the current directory changes to that repository
- AND the prompt updates

#### Scenario: Change to subdirectory
- GIVEN the user is in a repository
- WHEN executing `cd <directory>`
- THEN the current directory changes to that subdirectory

#### Scenario: Go up one directory
- GIVEN the user is not at root
- WHEN executing `cd ..`
- THEN the current directory changes to parent

#### Scenario: Go to root
- GIVEN the user is anywhere
- WHEN executing `cd /`
- THEN the current directory changes to root

#### Scenario: Go to previous directory
- GIVEN the user has changed directories before
- WHEN executing `cd -`
- THEN the current directory changes to the previous directory
- AND the path is displayed

---

### Requirement: `pwd` - Print Working Directory
The system SHALL display the current directory path.

#### Scenario: Show current path
- GIVEN the user is in any directory
- WHEN executing `pwd`
- THEN the full path is displayed

---

## File Operations

### Requirement: `cat` - Display File
The system SHALL display file contents with syntax highlighting.

#### Scenario: Display file
- GIVEN the user is in a repository
- WHEN executing `cat <file>`
- THEN the file contents are displayed
- AND syntax highlighting is applied based on file extension

#### Scenario: Invalid target
- GIVEN the user executes `cat` on a directory
- THEN an error "Not a file" is displayed

---

### Requirement: `head` - Display First Lines
The system SHALL display the first N lines of a file.

#### Scenario: Default 10 lines
- GIVEN the user executes `head <file>`
- THEN the first 10 lines are displayed

#### Scenario: Custom line count
- GIVEN the user executes `head <file> 5`
- THEN the first 5 lines are displayed

---

### Requirement: `tail` - Display Last Lines
The system SHALL display the last N lines of a file.

#### Scenario: Default 10 lines
- GIVEN the user executes `tail <file>`
- THEN the last 10 lines are displayed

#### Scenario: Custom line count
- GIVEN the user executes `tail <file> 5`
- THEN the last 5 lines are displayed

---

### Requirement: `readme` - Display README
The system SHALL display the README file in the current directory.

#### Scenario: README exists
- GIVEN a README.md exists in the current directory
- WHEN executing `readme`
- THEN the README contents are displayed

#### Scenario: No README
- GIVEN no README file exists
- WHEN executing `readme`
- THEN an error "No README file found" is displayed

---

### Requirement: `download` - Download File
The system SHALL download files to the user's computer.

#### Scenario: Download file
- GIVEN the user executes `download <file>`
- THEN the file download is initiated
- AND a success message is displayed

---

### Requirement: `grep` - Search in Files
The system SHALL search for patterns in files.

#### Scenario: Single file search
- GIVEN the user executes `grep <pattern> <file>`
- THEN all matching lines are displayed
- AND line numbers are shown
- AND the pattern is highlighted

#### Scenario: Case-insensitive search
- GIVEN the user executes `grep -i <pattern> <file>`
- THEN matches are case-insensitive

#### Scenario: No matches
- GIVEN no matches are found
- THEN "No matches found" is displayed

#### Scenario: Repo-wide search
- GIVEN the user executes `grep <pattern>` (no file)
- THEN a GitHub search link is provided
- AND an explanation that repo-wide search requires authentication

---

## Repository Commands

### Requirement: `tree` - Directory Tree
The system SHALL display a directory tree structure.

#### Scenario: Tree at root
- GIVEN the user is at root
- WHEN executing `tree`
- THEN all repository names are listed

#### Scenario: Tree in repository
- GIVEN the user is in a repository
- WHEN executing `tree`
- THEN the directory structure is displayed with depth limit of 3

---

### Requirement: `info` - Repository Info
The system SHALL display repository details.

#### Scenario: Show repo info
- GIVEN the user is in a repository
- WHEN executing `info`
- THEN repository details are displayed:
  - Full name
  - Description
  - Language
  - Stars, forks, watchers
  - License
  - Topics (if any)
  - Homepage (if any)
  - GitHub URL

---

### Requirement: `connect` - Switch User
The system SHALL allow switching to a different GitHub user.

#### Scenario: Valid user
- GIVEN the user executes `connect <username>`
- AND the username exists on GitHub
- THEN the current GitHub user changes
- AND repositories are loaded for the new user
- AND the path resets to root

#### Scenario: Invalid user
- GIVEN the user executes `connect <invalid-username>`
- THEN an error message is displayed

---

### Requirement: `whoami` - Show Current User
The system SHALL display the current GitHub user.

#### Scenario: Display user
- WHEN executing `whoami`
- THEN the current GitHub username is displayed

---

## Other Commands

### Requirement: `help` - Show Help
The system SHALL display available commands and usage.

#### Scenario: Display help
- WHEN executing `help`
- THEN all commands are listed with descriptions
- AND commands are grouped by category
- AND tips are displayed

---

### Requirement: `clear` - Clear Screen
The system SHALL clear the terminal output.

#### Scenario: Clear output
- WHEN executing `clear`
- THEN all previous output is removed

---

### Requirement: `exit` - Exit Terminal
The system SHALL display an exit message.

#### Scenario: Exit
- WHEN executing `exit`
- THEN "Goodbye!" is displayed
## Requirements
### Requirement: `log` - Display Commit History
The system SHALL display recent commit history for the current repository.

#### Scenario: Display default commits
- **GIVEN** the user is in a repository
- **WHEN** executing `log`
- **THEN** the last 10 commits are displayed
- **AND** each commit shows short hash, author, date, and message

#### Scenario: Custom commit count
- **GIVEN** the user is in a repository
- **WHEN** executing `log 20`
- **THEN** the last 20 commits are displayed

#### Scenario: Not in a repository
- **GIVEN** the user is at root (`/`)
- **WHEN** executing `log`
- **THEN** an error "Not in a repository" is displayed

### Requirement: Grep Pattern Validation
The system SHALL validate search patterns before use.

#### Scenario: Reject overly long patterns
- **GIVEN** the user executes `grep` with a pattern longer than 100 characters
- **WHEN** the command runs
- **THEN** an error "Invalid pattern: Pattern too long (max 100 characters)" is displayed

#### Scenario: Reject dangerous regex patterns
- **GIVEN** the user executes `grep` with a ReDoS pattern like `(a+)+`
- **WHEN** the command runs
- **THEN** an error "Invalid pattern: Pattern contains potentially dangerous regex" is displayed

#### Scenario: Accept valid patterns
- **GIVEN** the user executes `grep` with a normal pattern
- **WHEN** the pattern passes validation
- **THEN** the search proceeds normally

### Requirement: Download URL Validation
The system SHALL validate download URLs before use.

#### Scenario: Reject non-HTTPS URLs
- **GIVEN** the user executes `download` and GitHub returns a non-HTTPS URL
- **WHEN** the command runs
- **THEN** an error "Invalid download URL - security check failed" is displayed

#### Scenario: Reject non-GitHub URLs
- **GIVEN** the user executes `download` and URL is not from GitHub domains
- **WHEN** the command runs
- **THEN** an error "Invalid download URL - security check failed" is displayed

#### Scenario: Accept valid GitHub URLs
- **GIVEN** the user executes `download` and URL is valid GitHub HTTPS URL
- **WHEN** the command runs
- **THEN** the download proceeds normally

