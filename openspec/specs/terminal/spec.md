# Terminal UI Specification

## Overview

The terminal UI provides a web-based terminal interface that mimics SSH access to a virtual machine with GitHub repositories as a file system.

---

## Requirements

### Requirement: Terminal Display
The system SHALL provide a terminal-like interface with proper styling.

#### Scenario: Welcome message on load
- GIVEN a user opens the application
- WHEN the page loads
- THEN the system displays a welcome message with version and current GitHub user
- AND prompts the user to type 'help'

#### Scenario: Command prompt
- GIVEN the terminal is ready for input
- WHEN displaying the prompt
- THEN it shows format `guest@github-os:<path>$`
- AND uses `~` for root directory

---

### Requirement: Command Input
The system SHALL accept commands via text input.

#### Scenario: Execute command on Enter
- GIVEN the user has typed a command
- WHEN the user presses Enter
- THEN the command is executed
- AND the input field is cleared
- AND the command is added to history

#### Scenario: Empty command handling
- GIVEN the input field is empty
- WHEN the user presses Enter
- THEN nothing happens
- AND no output is displayed

#### Scenario: Ctrl+L clears screen
- GIVEN the terminal has output displayed
- WHEN the user presses Ctrl+L
- THEN the output is cleared
- AND the input is preserved

#### Scenario: Ctrl+U clears input line
- GIVEN the user has typed text
- WHEN the user presses Ctrl+U
- THEN the input is cleared

#### Scenario: Ctrl+K clears after cursor
- GIVEN the user has typed text with cursor not at end
- WHEN the user presses Ctrl+K
- THEN text after cursor is removed

#### Scenario: Ctrl+A moves to start
- GIVEN the cursor is in the input
- WHEN the user presses Ctrl+A
- THEN cursor moves to beginning

#### Scenario: Ctrl+E moves to end
- GIVEN the cursor is in the input
- WHEN the user presses Ctrl+E
- THEN cursor moves to end

#### Scenario: Ctrl+R starts history search
- GIVEN command history exists
- WHEN the user presses Ctrl+R
- THEN history search mode is activated

---

### Requirement: Command History
The system SHALL maintain a history of executed commands.

#### Scenario: Navigate history with arrow keys
- GIVEN commands have been executed previously
- WHEN the user presses Arrow Up
- THEN the previous command is displayed in the input
- WHEN the user presses Arrow Down
- THEN the next command in history is displayed

#### Scenario: History at boundaries
- GIVEN the user is at the oldest command
- WHEN pressing Arrow Up
- THEN no change occurs
- GIVEN the user is at the newest position
- WHEN pressing Arrow Down
- THEN the input is cleared

---

### Requirement: Tab Completion
The system SHALL provide intelligent tab completion for paths.

#### Scenario: Single match completion
- GIVEN the user types a partial path with one match
- WHEN the user presses Tab
- THEN the path is completed automatically
- AND a space is appended

#### Scenario: Multiple match cycling
- GIVEN the user types a partial path with multiple matches
- WHEN the user presses Tab repeatedly
- THEN the system cycles through all matching options
- AND loops back to the first match

#### Scenario: Reset tab state on typing
- GIVEN tab completion is active
- WHEN the user types any character (except Tab)
- THEN the tab completion state is reset

---

### Requirement: Output Display
The system SHALL display command output with proper formatting.

#### Scenario: Syntax highlighting
- GIVEN a file is displayed with `cat`, `head`, or `tail`
- WHEN the file has a recognized extension
- THEN syntax highlighting is applied using highlight.js

#### Scenario: Color coding
- GIVEN output is displayed
- THEN directories are shown in blue (#58a6ff)
- AND errors are shown in red (#f85149)
- AND success messages are shown in green (#3fb950)
- AND info text is shown in gray (#8b949e)

---

### Requirement: Terminal Scroll
The system SHALL maintain scroll behavior.

#### Scenario: Auto-scroll on output
- GIVEN new output is added
- WHEN the output exceeds viewport
- THEN the terminal scrolls to show the latest content

#### Scenario: Manual scroll
- GIVEN the user scrolls up
- WHEN new output arrives
- THEN the scroll position is maintained until user scrolls to bottom

---

### Requirement: Clear Screen
The system SHALL allow clearing the terminal output.

#### Scenario: Clear command
- GIVEN the user executes `clear`
- THEN all previous output is removed
- AND only the prompt remains
