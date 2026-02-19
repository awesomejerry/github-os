# Theme System Specification

## Purpose

Color theme system for the terminal UI.

---

## Requirements

### Requirement: List available themes
The system SHALL provide multiple color themes.

#### Scenario: Show available themes
- WHEN executing `theme list`
- THEN all 6 themes are displayed
- AND the current theme is marked with ✓

---

### Requirement: Get current theme
The system SHALL display the current theme.

#### Scenario: Show current theme
- GIVEN a theme is set
- WHEN executing `theme`
- THEN the current theme name and label are displayed

#### Scenario: Default theme
- GIVEN no theme has been set
- WHEN the app loads
- THEN "dark" is the default theme

---

### Requirement: Set theme
The system SHALL allow changing the theme.

#### Scenario: Set valid theme
- GIVEN the theme "light" exists
- WHEN executing `theme set light`
- THEN the theme is changed to "light"
- AND the DOM class is updated to "theme-light"
- AND the theme is saved to localStorage

#### Scenario: Set invalid theme
- GIVEN the theme "nonexistent" does not exist
- WHEN executing `theme set nonexistent`
- THEN an error "Unknown theme" is displayed
- AND the available themes are listed

---

### Requirement: Persist theme selection
The system SHALL persist theme selection.

#### Scenario: Load saved theme
- GIVEN a theme was previously saved
- WHEN the app loads
- THEN the saved theme is loaded
- AND the DOM class is updated

---

### Requirement: Command signature
The theme command SHALL use correct signature.

#### Scenario: Command is called correctly
- GIVEN the user types `theme`
- WHEN the command is executed
- THEN it receives (terminal, githubUser, args)
- AND args is an empty array []
- AND "Unknown theme command: a" is NOT displayed

---

## Files

- `scripts/themes.js` - Theme management
- `scripts/commands.js` - cmdTheme
- `styles/themes/*.css` - Theme stylesheets

## Status

✅ Implemented in v2.3.0
✅ Bug fixed in v2.3.2 (command signature)
