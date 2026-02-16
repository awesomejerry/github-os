## ADDED Requirements

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
