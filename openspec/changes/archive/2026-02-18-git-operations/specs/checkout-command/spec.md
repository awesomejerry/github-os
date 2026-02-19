## ADDED Requirements

### Requirement: `checkout` - Switch Branch
The system SHALL allow users to switch the current branch context.

#### Scenario: Switch to existing branch
- **GIVEN** the user is in a repository
- **AND** the user is authenticated
- **WHEN** executing `checkout <branch-name>`
- **THEN** the current branch context is updated
- **AND** cached data is cleared
- **AND** a success message is displayed

#### Scenario: Branch does not exist
- **GIVEN** the user is in a repository
- **WHEN** executing `checkout <non-existent-branch>`
- **THEN** an error "Branch not found" is displayed

#### Scenario: Not in a repository
- **GIVEN** the user is at root (`/`)
- **WHEN** executing `checkout <branch>`
- **THEN** an error "Not in a repository" is displayed

#### Scenario: No branch specified
- **GIVEN** the user is in a repository
- **WHEN** executing `checkout` without arguments
- **THEN** a usage message is displayed

### Requirement: Branch Context Persistence
The system SHALL persist the current branch context during the session.

#### Scenario: Branch context maintained
- **GIVEN** the user has checked out a branch
- **WHEN** executing subsequent commands (ls, cat, log, etc.)
- **THEN** data is fetched from the current branch context
