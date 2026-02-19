## ADDED Requirements

### Requirement: Display Current Theme
The system SHALL display the currently active theme.

#### Scenario: Show active theme
- **WHEN** executing `theme`
- **THEN** the current theme name is displayed

### Requirement: List Available Themes
The system SHALL list all available themes.

#### Scenario: List all themes
- **WHEN** executing `theme list`
- **THEN** all available themes are displayed
- **AND** the current theme is marked with an indicator

### Requirement: Set Theme
The system SHALL allow setting a theme by name.

#### Scenario: Set valid theme
- **WHEN** executing `theme set <name>` with a valid theme name
- **THEN** the theme changes immediately
- **AND** the theme is persisted to localStorage
- **AND** a confirmation message is displayed

#### Scenario: Set invalid theme
- **WHEN** executing `theme set <name>` with an invalid theme name
- **THEN** an error "Unknown theme: <name>" is displayed
- **AND** available themes are listed

### Requirement: Theme Persistence
The system SHALL persist theme selection across sessions.

#### Scenario: Load saved theme
- **GIVEN** a theme was previously saved
- **WHEN** the terminal loads
- **THEN** the saved theme is applied

#### Scenario: No saved theme
- **GIVEN** no theme was previously saved
- **WHEN** the terminal loads
- **THEN** the default "dark" theme is applied

### Requirement: Available Themes
The system SHALL provide the following themes: dark, light, solarized-dark, solarized-light, monokai, gruvbox.

#### Scenario: Dark theme available
- **GIVEN** the terminal is loaded
- **WHEN** checking available themes
- **THEN** "dark" is available as the default theme

#### Scenario: Light theme available
- **GIVEN** the terminal is loaded
- **WHEN** checking available themes
- **THEN** "light" is available

#### Scenario: Solarized themes available
- **GIVEN** the terminal is loaded
- **WHEN** checking available themes
- **THEN** "solarized-dark" and "solarized-light" are available

#### Scenario: Monokai theme available
- **GIVEN** the terminal is loaded
- **WHEN** checking available themes
- **THEN** "monokai" is available

#### Scenario: Gruvbox theme available
- **GIVEN** the terminal is loaded
- **WHEN** checking available themes
- **THEN** "gruvbox" is available
