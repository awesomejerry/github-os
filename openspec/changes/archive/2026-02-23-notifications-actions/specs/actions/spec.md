## ADDED Requirements

### Requirement: User can list workflow runs
The system SHALL allow authenticated users to list GitHub Actions workflow runs for a repository.

#### Scenario: List workflow runs
- **WHEN** user runs `actions` command while in a repository
- **THEN** system displays workflow runs with status icon, workflow name, run number, branch, status, duration, and relative timestamp
- **AND** system shows total run count

#### Scenario: List runs without repository context
- **WHEN** user runs `actions` command from root directory
- **THEN** system displays error "Not in a repository. Use 'cd' to enter a repo first."

#### Scenario: List runs without authentication
- **WHEN** unauthenticated user runs `actions` command
- **THEN** system displays error message "Authentication required. Use 'login' to connect."

### Requirement: User can view workflow run details
The system SHALL allow authenticated users to view details and logs of a specific workflow run.

#### Scenario: View run details
- **WHEN** user runs `actions view <run-id>` command
- **THEN** system displays run details including workflow name, status, conclusion, branch, commit, and trigger event
- **AND** system displays job steps with status indicators
- **AND** system displays logs (truncated if large)

#### Scenario: View non-existent run
- **WHEN** user runs `actions view <invalid-id>` command
- **THEN** system displays error "Run not found"

### Requirement: User can rerun workflow
The system SHALL allow authenticated users to re-run a workflow.

#### Scenario: Rerun workflow
- **WHEN** user runs `actions rerun <run-id>` command
- **THEN** system triggers workflow rerun
- **AND** system displays success confirmation with link to run

#### Scenario: Rerun without confirmation
- **WHEN** user runs `actions rerun <run-id>` command
- **THEN** system asks for confirmation before rerunning

#### Scenario: Rerun non-existent run
- **WHEN** user runs `actions rerun <invalid-id>` command
- **THEN** system displays error "Run not found"

### Requirement: User can list repository workflows
The system SHALL allow authenticated users to list available workflows in a repository.

#### Scenario: List workflows
- **WHEN** user runs `actions --repo` command while in a repository
- **THEN** system displays list of workflow files with name and state (active/disabled)

### Requirement: Actions output format
The system SHALL format actions output consistently.

#### Scenario: Run list output format
- **WHEN** workflow runs are displayed
- **THEN** each run shows:
  - Status icon (✅ success, ❌ failure, 🔄 in_progress, ⏸️ queued)
  - Workflow name with run number in parentheses
  - Branch name
  - Status, duration, and relative timestamp on second line

### Requirement: Empty runs state
The system SHALL handle empty workflow runs list gracefully.

#### Scenario: No workflow runs
- **WHEN** repository has no workflow runs
- **THEN** system displays "No workflow runs found" message
