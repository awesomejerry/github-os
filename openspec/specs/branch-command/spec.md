# branch-command Specification

## Purpose
TBD - created by archiving change add-branch-command. Update Purpose after archive.
## Requirements
### Requirement: `branch` - Display Branches
The system SHALL display all branches for the current repository.

#### Scenario: Display branches
- **GIVEN** the user is in a repository
- **WHEN** executing `branch`
- **THEN** all branches are listed
- **AND** the default branch is marked with *

#### Scenario: Not in a repository
- **GIVEN** the user is at root (`/`)
- **WHEN** executing `branch`
- **THEN** an error "Not in a repository" is displayed

#### Scenario: Branch display format
- **GIVEN** branches exist
- **WHEN** displaying branches
- **THEN** each branch shows:
  - Asterisk (*) prefix if it is the default branch
  - Branch name in accent color
- **AND** a count of total branches is shown

