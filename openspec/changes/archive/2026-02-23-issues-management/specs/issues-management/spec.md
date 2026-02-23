## MODIFIED Requirements

### Requirement: List issues
The system SHALL allow listing repository issues with detailed output format.

#### Scenario: List open issues
- **GIVEN** the user is in a repository
- **WHEN** executing `issues`
- **THEN** all open issues are displayed
- **AND** each issue shows number, title, labels, and author on first line
- **AND** each issue shows status, comment count, and update time on second line

#### Scenario: List all issues including closed
- **GIVEN** the user is in a repository
- **WHEN** executing `issues --all`
- **THEN** all issues (open and closed) are displayed
- **AND** each issue shows status indicator (open/closed)

#### Scenario: Empty issues list
- **GIVEN** the repository has no issues
- **WHEN** executing `issues`
- **THEN** "No open issues found" is displayed

### Requirement: View issue details
The system SHALL allow viewing detailed issue information.

#### Scenario: View specific issue
- **GIVEN** issue #42 exists in the repository
- **WHEN** executing `issues view 42`
- **THEN** the issue details are displayed
- **AND** the title, body, author, state, and labels are shown
- **AND** the creation date and comment count are shown
- **AND** the issue URL is provided

#### Scenario: Issue not found
- **GIVEN** issue #999 does not exist
- **WHEN** executing `issues view 999`
- **THEN** an error "Issue not found" is displayed
