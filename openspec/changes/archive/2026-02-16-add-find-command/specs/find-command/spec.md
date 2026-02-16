## ADDED Requirements

### Requirement: `find` - Find Files by Pattern
The system SHALL find files matching a pattern across the entire repository.

#### Scenario: Find files with wildcard
- **GIVEN** the user is in a repository
- **WHEN** executing `find *.js`
- **THEN** all files ending with `.js` are listed
- **AND** paths are relative to repository root
- **AND** a count of matches is shown

#### Scenario: Find files with literal text
- **GIVEN** the user is in a repository
- **WHEN** executing `find test`
- **THEN** all files with "test" in the path are listed

#### Scenario: Not in a repository
- **GIVEN** the user is at root (`/`)
- **WHEN** executing `find <pattern>`
- **THEN** an error "Not in a repository" is displayed

#### Scenario: No pattern provided
- **GIVEN** the user executes `find` without arguments
- **WHEN** the command runs
- **THEN** usage help is displayed

#### Scenario: No matches found
- **GIVEN** the user is in a repository
- **WHEN** executing `find nonexistent`
- **THEN** "No files found matching 'nonexistent'" is displayed

#### Scenario: Pattern syntax
- **GIVEN** a pattern is provided
- **WHEN** matching files
- **THEN** `*` matches any sequence of characters
- **AND** `?` matches any single character
- **AND** pattern is case-insensitive
