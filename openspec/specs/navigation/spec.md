# navigation Specification

## Purpose
TBD - created by archiving change orgs-teams. Update Purpose after archive.
## Requirements
### Requirement: Organization Path Format
The system SHALL support `@org` format for organization paths.

#### Scenario: Parse @org path format
- **GIVEN** the user inputs a path starting with `@`
- **WHEN** the path is parsed
- **THEN** the first segment after `@` is recognized as organization name
- **AND** subsequent segments are treated as repo/path within the organization

#### Scenario: Navigate to @org
- **GIVEN** the user executes `cd @github`
- **WHEN** the command is processed
- **THEN** the context changes to the github organization
- **AND** organization repos can be listed

#### Scenario: Navigate to @org/repo
- **GIVEN** the user executes `cd @github/actions`
- **WHEN** the command is processed
- **THEN** the context changes to the actions repository in github organization
- **AND** repository contents can be listed

---

### Requirement: Root Directory Shows Organizations
The system SHALL display organizations alongside personal repos at root.

#### Scenario: List at root shows organizations
- **GIVEN** the user is logged in
- **WHEN** executing `ls` at root (`/`)
- **THEN** organizations the user belongs to are listed with `@` prefix
- **AND** personal repositories are listed under `~` indicator

#### Scenario: Distinguish org repos from personal repos
- **GIVEN** the user has both personal repos and org memberships
- **WHEN** listing at root
- **THEN** organization paths are prefixed with `@`
- **AND** personal repo names have no prefix

