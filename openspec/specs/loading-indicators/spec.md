# loading-indicators Specification

## Purpose
TBD - created by archiving change add-loading-indicators. Update Purpose after archive.
## Requirements
### Requirement: Loading Indicators
The system SHALL show loading indicators during async operations.

#### Scenario: Show loading before API call
- **GIVEN** the user executes an async command (ls, cat, info, log, etc.)
- **WHEN** the API call starts
- **THEN** a loading indicator with spinner is displayed

#### Scenario: Hide loading after API call
- **GIVEN** a loading indicator is displayed
- **WHEN** the API call completes (success or error)
- **THEN** the loading indicator is removed

#### Scenario: Loading with custom message
- **GIVEN** the user executes a command with known context
- **WHEN** loading starts
- **THEN** a context-specific message is shown (e.g., "Searching for x...")

