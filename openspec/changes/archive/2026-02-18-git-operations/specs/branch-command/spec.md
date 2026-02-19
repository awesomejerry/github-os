## ADDED Requirements

### Requirement: `branch -c` - Create Branch
The system SHALL allow authenticated users to create new branches.

#### Scenario: Create new branch successfully
- **GIVEN** the user is in a repository
- **AND** the user is authenticated
- **WHEN** executing `branch -c <new-branch-name>`
- **THEN** a new branch is created from the default branch HEAD
- **AND** a success message is displayed
- **AND** branch cache is cleared

#### Scenario: Create branch without authentication
- **GIVEN** the user is in a repository
- **AND** the user is NOT authenticated
- **WHEN** executing `branch -c <name>`
- **THEN** an error "Authentication required" is displayed

#### Scenario: Branch already exists
- **GIVEN** the user is in a repository
- **AND** a branch with the same name already exists
- **WHEN** executing `branch -c <existing-name>`
- **THEN** an error "Branch already exists" is displayed

#### Scenario: Invalid branch name
- **GIVEN** the user is in a repository
- **WHEN** executing `branch -c` with invalid name (empty, spaces, special chars)
- **THEN** an error indicating invalid branch name is displayed

#### Scenario: No branch name provided
- **GIVEN** the user is in a repository
- **WHEN** executing `branch -c` without a name
- **THEN** a usage message is displayed

### Requirement: `branch -d` - Delete Branch
The system SHALL allow authenticated users to delete branches.

#### Scenario: Delete branch successfully
- **GIVEN** the user is in a repository
- **AND** the user is authenticated
- **WHEN** executing `branch -d <branch-name>`
- **THEN** the branch is deleted
- **AND** a success message is displayed
- **AND** branch cache is cleared

#### Scenario: Delete without authentication
- **GIVEN** the user is in a repository
- **AND** the user is NOT authenticated
- **WHEN** executing `branch -d <name>`
- **THEN** an error "Authentication required" is displayed

#### Scenario: Delete default branch
- **GIVEN** the user is in a repository
- **WHEN** executing `branch -d <default-branch-name>`
- **THEN** an error "Cannot delete default branch" is displayed

#### Scenario: Delete current branch
- **GIVEN** the user is in a repository
- **AND** the user has checked out a branch
- **WHEN** executing `branch -d <current-branch-name>`
- **THEN** an error "Cannot delete current branch" is displayed

#### Scenario: Delete protected branch
- **GIVEN** the user is in a repository
- **AND** the branch is protected
- **WHEN** executing `branch -d <protected-branch-name>`
- **THEN** an error from GitHub API is displayed

#### Scenario: Branch not found
- **GIVEN** the user is in a repository
- **WHEN** executing `branch -d <non-existent-branch>`
- **THEN** an error "Branch not found" is displayed

#### Scenario: No branch name provided for delete
- **GIVEN** the user is in a repository
- **WHEN** executing `branch -d` without a name
- **THEN** a usage message is displayed
