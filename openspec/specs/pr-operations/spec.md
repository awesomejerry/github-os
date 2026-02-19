# PR Operations Specification

## Purpose

This specification defines the pull request lifecycle management capabilities of GitHub OS, including creating, merging, and closing pull requests through the CLI interface.

## Requirements

### Requirement: PR Creation - Interactive Mode
The system SHALL allow authenticated users to create pull requests interactively by prompting for title and body when not provided via command flags.

#### Scenario: Interactive PR creation with prompts
- **GIVEN** the user is authenticated
- **WHEN** user runs `pr create` without flags while authenticated
- **THEN** system prompts for PR title
- **AND** system prompts for PR body
- **AND** system creates PR with provided title and body
- **AND** system displays success message with PR number and URL

#### Scenario: Interactive PR creation cancelled
- **GIVEN** the user is authenticated
- **WHEN** user runs `pr create` and provides empty title
- **THEN** system displays error "PR title is required"
- **AND** system does not create PR

### Requirement: PR Creation - Direct Mode
The system SHALL allow authenticated users to create pull requests directly by providing title and body via command flags.

#### Scenario: Direct PR creation with all flags
- **GIVEN** the user is authenticated
- **WHEN** user runs `pr create -t "Add feature" -b "Description"` while authenticated
- **THEN** system creates PR with specified title and body
- **AND** system displays success message with PR number and URL

#### Scenario: Direct PR creation missing title
- **GIVEN** the user is authenticated
- **WHEN** user runs `pr create -b "Description"` without -t flag
- **THEN** system displays error "PR title required. Use -t flag"

#### Scenario: Direct PR creation missing body
- **GIVEN** the user is authenticated
- **WHEN** user runs `pr create -t "Title"` without -b flag
- **THEN** system prompts for PR body interactively

### Requirement: PR Branch Detection
The system SHALL automatically detect head and base branches for PR creation based on current repository state.

#### Scenario: Automatic branch detection
- **GIVEN** the user is authenticated
- **WHEN** user creates PR from feature branch
- **THEN** system uses current checked-out branch as head branch
- **AND** system uses repository default branch as base branch

#### Scenario: Branch detection with explicit checkout
- **GIVEN** the user is authenticated
- **WHEN** user ran `checkout feature-branch` before `pr create`
- **THEN** system sets head branch to "feature-branch"

### Requirement: PR Merge Operation
The system SHALL allow authenticated users to merge pull requests with explicit confirmation to prevent accidental merges.

#### Scenario: Successful PR merge with confirmation
- **GIVEN** the user is authenticated
- **WHEN** user runs `pr merge 42` while authenticated
- **THEN** system displays warning "This will merge PR #42"
- **AND** system prompts "Type 'yes' to confirm:"
- **GIVEN** the user is authenticated
- **WHEN** user types "yes"
- **THEN** system merges PR using merge commit method
- **AND** system displays success message with commit SHA

#### Scenario: PR merge cancelled
- **GIVEN** the user is authenticated
- **WHEN** user runs `pr merge 42` and types anything other than "yes"
- **THEN** system displays "Merge cancelled"
- **AND** system does not merge PR

#### Scenario: PR merge without authentication
- **GIVEN** the user is authenticated
- **WHEN** unauthenticated user runs `pr merge 42`
- **THEN** system displays error "Authentication required. Use 'login' to connect."

#### Scenario: PR merge with conflicts
- **GIVEN** the user is authenticated
- **WHEN** user attempts to merge PR with merge conflicts
- **THEN** system displays error "Merge failed: PR has conflicts that must be resolved"
- **AND** system does not merge PR

### Requirement: PR Close Operation
The system SHALL allow authenticated users to close pull requests with explicit confirmation to prevent accidental closures.

#### Scenario: Successful PR close with confirmation
- **GIVEN** the user is authenticated
- **WHEN** user runs `pr close 42` while authenticated
- **THEN** system displays warning "This will close PR #42"
- **AND** system prompts "Type 'yes' to confirm:"
- **GIVEN** the user is authenticated
- **WHEN** user types "yes"
- **THEN** system closes PR
- **AND** system displays success message

#### Scenario: PR close cancelled
- **GIVEN** the user is authenticated
- **WHEN** user runs `pr close 42` and types anything other than "yes"
- **THEN** system displays "Close cancelled"
- **AND** system does not close PR

#### Scenario: PR close without authentication
- **GIVEN** the user is authenticated
- **WHEN** unauthenticated user runs `pr close 42`
- **THEN** system displays error "Authentication required. Use 'login' to connect."

### Requirement: PR Error Handling
The system SHALL provide user-friendly error messages for all PR operation failures.

#### Scenario: PR not found
- **GIVEN** the user is authenticated
- **WHEN** user runs `pr merge 999` for non-existent PR
- **THEN** system displays error "PR #999 not found"

#### Scenario: Permission denied
- **GIVEN** the user is authenticated
- **WHEN** user attempts PR operation without write permission
- **THEN** system displays error "Permission denied. You need write access to this repository."

#### Scenario: Validation failure
- **GIVEN** the user is authenticated
- **WHEN** PR creation fails validation (e.g., same head and base branch)
- **THEN** system displays error with specific validation message from GitHub

#### Scenario: Network error
- **GIVEN** the user is authenticated
- **WHEN** API request fails due to network issue
- **THEN** system displays error "Failed to connect to GitHub. Please check your connection."

### Requirement: PR Authentication Requirement
The system SHALL require authentication for all PR operations (create, merge, close).

#### Scenario: Unauthenticated PR create
- **GIVEN** the user is authenticated
- **WHEN** unauthenticated user runs `pr create`
- **THEN** system displays error "Authentication required. Use 'login' to connect."
- **AND** system does not attempt API call

#### Scenario: Authenticated PR operations
- **GIVEN** the user is authenticated
- **WHEN** authenticated user runs any PR command
- **THEN** system includes Authorization header in all API requests
- **AND** system uses Bearer token from current session

### Requirement: PR Output Format
The system SHALL display clear, formatted output for all PR operations.

#### Scenario: PR creation success output
- **GIVEN** the user is authenticated
- **WHEN** PR is created successfully
- **THEN** system displays:
  - "Created PR #<number>"
  - "<title>"
  - "<PR URL>"

#### Scenario: PR merge success output
- **GIVEN** the user is authenticated
- **WHEN** PR is merged successfully
- **THEN** system displays:
  - "Merged PR #<number>"
  - "Commit: <sha>"
  - "<PR URL>"

#### Scenario: PR close success output
- **GIVEN** the user is authenticated
- **WHEN** PR is closed successfully
- **THEN** system displays:
  - "Closed PR #<number>"
  - "<PR URL>"

### Requirement: PR Loading States
The system SHALL display loading indicators during PR operations.

#### Scenario: PR operation loading
- **GIVEN** the user is authenticated
- **WHEN** user initiates PR operation
- **THEN** system displays loading indicator with operation description
- **AND** system hides loading indicator when operation completes

#### Scenario: PR creation loading
- **GIVEN** the user is authenticated
- **WHEN** user creates PR
- **THEN** system displays "Creating PR..."
- **AND** system hides loading on success or error
