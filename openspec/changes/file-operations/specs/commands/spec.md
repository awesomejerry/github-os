## ADDED Requirements

### Requirement: File Operation Commands Registry
The system SHALL register file operation commands in the command registry.

#### Scenario: Commands available
- **GIVEN** the terminal is loaded
- **WHEN** checking available commands
- **THEN** `touch`, `mkdir`, `rm`, `mv`, `cp` are registered
- **AND** they appear in help output under "File Operations"

---

### Requirement: File Operation Error Handling
The system SHALL provide consistent error handling for file operations.

#### Scenario: 401 Unauthorized response
- **GIVEN** the API returns 401
- **WHEN** handling the error
- **THEN** "Authentication required. Use 'login' to connect." is displayed

#### Scenario: 403 Forbidden response
- **GIVEN** the API returns 403
- **WHEN** handling the error
- **THEN** "Permission denied. Check repository access." is displayed

#### Scenario: 404 Not Found response
- **GIVEN** the API returns 404
- **WHEN** handling the error
- **THEN** "Not found" or appropriate context message is displayed
