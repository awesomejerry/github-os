## ADDED Requirements

### Requirement: Theme Command Registration
The system SHALL register the theme command in the command registry.

#### Scenario: Theme command available
- **GIVEN** the terminal is loaded
- **WHEN** checking available commands
- **THEN** `theme` is registered
- **AND** it appears in help output

### Requirement: Theme Command Help
The system SHALL display help for the theme command.

#### Scenario: Show theme help
- **WHEN** executing `help theme`
- **THEN** usage information is displayed:
  - `theme` - Show current theme
  - `theme list` - List available themes
  - `theme set <name>` - Set theme
