## ADDED Requirements

### Requirement: Create Branch
The system SHALL provide a function to create a new branch via GitHub API.

#### Scenario: Successful branch creation
- **GIVEN** a valid owner, repo, and new branch name
- **AND** the user is authenticated with repo scope
- **WHEN** calling `createBranch(owner, repo, branchName)`
- **THEN** a new branch is created from the default branch HEAD
- **AND** the new branch reference is returned

#### Scenario: Branch already exists
- **GIVEN** a branch with the same name already exists
- **WHEN** calling `createBranch(owner, repo, branchName)`
- **THEN** an error "Branch already exists" is raised

#### Scenario: Authentication required
- **GIVEN** the user is not authenticated
- **WHEN** calling `createBranch(owner, repo, branchName)`
- **THEN** an error indicating authentication is required is raised

### Requirement: Delete Branch
The system SHALL provide a function to delete a branch via GitHub API.

#### Scenario: Successful branch deletion
- **GIVEN** a valid owner, repo, and branch name
- **AND** the user is authenticated with repo scope
- **WHEN** calling `deleteBranch(owner, repo, branchName)`
- **THEN** the branch is deleted
- **AND** success is returned

#### Scenario: Delete default branch
- **GIVEN** the branch is the repository's default branch
- **WHEN** calling `deleteBranch(owner, repo, branchName)`
- **THEN** an error "Cannot delete default branch" is raised

#### Scenario: Branch not found
- **GIVEN** the branch does not exist
- **WHEN** calling `deleteBranch(owner, repo, branchName)`
- **THEN** an error "Branch not found" is raised

#### Scenario: Protected branch
- **GIVEN** the branch is protected
- **WHEN** calling `deleteBranch(owner, repo, branchName)`
- **THEN** the GitHub API error is propagated

### Requirement: Get Default Branch SHA
The system SHALL provide a function to get the SHA of the default branch HEAD.

#### Scenario: Successful SHA retrieval
- **GIVEN** a valid owner and repo
- **WHEN** calling `getDefaultBranchSHA(owner, repo)`
- **THEN** the SHA of the default branch HEAD is returned

#### Scenario: Repository not found
- **GIVEN** an invalid owner or repo
- **WHEN** calling `getDefaultBranchSHA(owner, repo)`
- **THEN** an error is raised
