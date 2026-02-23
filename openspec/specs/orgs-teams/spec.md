# orgs-teams Specification

## Purpose
TBD - created by archiving change orgs-teams. Update Purpose after archive.
## Requirements
### Requirement: `org` - List Organizations
The system SHALL allow users to list their GitHub organizations.

#### Scenario: List organizations
- **GIVEN** the user is logged in
- **WHEN** executing `org`
- **THEN** all organizations the user belongs to are listed
- **AND** each org shows name and description
- **AND** the count of organizations is displayed

#### Scenario: List organizations when not logged in
- **GIVEN** the user is not logged in
- **WHEN** executing `org`
- **THEN** public organizations for the default user are listed

#### Scenario: No organizations
- **GIVEN** the user has no organization memberships
- **WHEN** executing `org`
- **THEN** "No organizations found" is displayed

---

### Requirement: `org <name>` - Navigate to Organization
The system SHALL allow navigating to an organization context.

#### Scenario: Navigate to valid organization
- **GIVEN** the user has access to the organization
- **WHEN** executing `org <name>`
- **THEN** the current context changes to that organization
- **AND** the organization's repositories are listed

#### Scenario: Organization not found
- **GIVEN** the organization does not exist or user lacks access
- **WHEN** executing `org <name>`
- **THEN** "Organization not found: <name>" is displayed

---

### Requirement: `org <name> --info` - Show Organization Details
The system SHALL display organization details.

#### Scenario: Show organization info
- **GIVEN** the user has access to the organization
- **WHEN** executing `org <name> --info`
- **THEN** organization details are displayed:
  - Name
  - Description
  - Location (if any)
  - Website (if any)
  - Public repository count
  - GitHub URL

#### Scenario: Organization not found
- **GIVEN** the organization does not exist
- **WHEN** executing `org <name> --info`
- **THEN** "Organization not found: <name>" is displayed

---

### Requirement: `teams` - List Organization Teams
The system SHALL list teams within the current organization context.

#### Scenario: List teams in organization context
- **GIVEN** the user has navigated to an organization with `org <name>`
- **AND** the user is logged in with `read:org` scope
- **WHEN** executing `teams`
- **THEN** all teams in the organization are listed
- **AND** each team shows name, description, and member count
- **AND** the count of teams is displayed

#### Scenario: Not in organization context
- **GIVEN** the user has not navigated to an organization
- **WHEN** executing `teams`
- **THEN** "Not in an organization. Use 'org <name>' first." is displayed

#### Scenario: No teams found
- **GIVEN** the organization has no teams
- **WHEN** executing `teams`
- **THEN** "No teams found in this organization" is displayed

#### Scenario: Missing read:org scope
- **GIVEN** the user is logged in without `read:org` scope
- **WHEN** executing `teams`
- **THEN** "Access denied. Re-login with 'read:org' scope to view teams." is displayed

---

### Requirement: `team <name>` - List Team Repositories
The system SHALL list repositories accessible to a specific team.

#### Scenario: List team repos
- **GIVEN** the user is in an organization context
- **AND** the user has access to the team
- **WHEN** executing `team <name>`
- **THEN** all repositories accessible to the team are listed
- **AND** each repo shows name, language, and permission level
- **AND** the count of repositories is displayed

#### Scenario: Team not found
- **GIVEN** the team does not exist or user lacks access
- **WHEN** executing `team <name>`
- **THEN** "Team not found: <name>" is displayed

#### Scenario: Team has no repos
- **GIVEN** the team exists but has no repositories
- **WHEN** executing `team <name>`
- **THEN** "No repositories assigned to this team" is displayed

---

### Requirement: `team <name> --members` - List Team Members
The system SHALL list members of a specific team.

#### Scenario: List team members
- **GIVEN** the user is in an organization context
- **AND** the user has access to the team
- **WHEN** executing `team <name> --members`
- **THEN** all team members are listed
- **AND** each member shows username and role
- **AND** the count of members is displayed

#### Scenario: Team not found
- **GIVEN** the team does not exist
- **WHEN** executing `team <name> --members`
- **THEN** "Team not found: <name>" is displayed

#### Scenario: Team has no members
- **GIVEN** the team exists but has no members
- **WHEN** executing `team <name> --members`
- **THEN** "No members in this team" is displayed

---

### Requirement: Organization Commands in Help
The system SHALL display organization commands in the help output.

#### Scenario: Commands appear in help
- **GIVEN** the terminal is loaded
- **WHEN** executing `help`
- **THEN** `org` and `team` commands are listed
- **AND** they appear under an "Organizations & Teams" category

#### Scenario: Tab completion for org commands
- **GIVEN** the user starts typing `org` or `team`
- **WHEN** pressing Tab
- **THEN** `org` and `team` commands are suggested

