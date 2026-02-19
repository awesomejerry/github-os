## MODIFIED Requirements

### Requirement: Command Input
The system SHALL accept commands via text input.

#### Scenario: Execute command on Enter
- **GIVEN** the user has typed a command
- **WHEN** the user presses Enter
- **THEN** the command is executed
- **AND** the input field is cleared
- **AND** the command is added to history

#### Scenario: Empty command handling
- **GIVEN** the input field is empty
- **WHEN** the user presses Enter
- **THEN** nothing happens
- **AND** no output is displayed

#### Scenario: Ctrl+L clears screen
- **GIVEN** the terminal has output displayed
- **WHEN** the user presses Ctrl+L
- **THEN** the output is cleared
- **AND** the input is preserved

#### Scenario: Ctrl+U clears input line
- **GIVEN** the user has typed text
- **WHEN** the user presses Ctrl+U
- **THEN** the input is cleared

#### Scenario: Ctrl+K clears after cursor
- **GIVEN** the user has typed text with cursor not at end
- **WHEN** the user presses Ctrl+K
- **THEN** text after cursor is removed

#### Scenario: Ctrl+A moves to start
- **GIVEN** the cursor is in the input
- **WHEN** the user presses Ctrl+A
- **THEN** cursor moves to beginning

#### Scenario: Ctrl+E moves to end
- **GIVEN** the cursor is in the input
- **WHEN** the user presses Ctrl+E
- **THEN** cursor moves to end

#### Scenario: Ctrl+R starts history search
- **GIVEN** command history exists
- **WHEN** the user presses Ctrl+R
- **THEN** history search mode is activated
