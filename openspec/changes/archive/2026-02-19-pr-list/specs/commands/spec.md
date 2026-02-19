## ADDED Requirements

### Requirement: `pr` Command Registration
The system SHALL register the `pr` command in the command registry.

#### Scenario: Command available
- **GIVEN** the terminal is loaded
- **WHEN** checking available commands
- **THEN** `pr` is registered
- **AND** it appears in help output under "Repository"

#### Scenario: Tab completion
- **GIVEN** the user starts typing `pr`
- **WHEN** pressing Tab
- **THEN** `pr` command is suggested
