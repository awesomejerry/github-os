# GitHub API Delta Specification

## Purpose

Add batch commit capability to the GitHub API module.

---

## ADDED Requirements

### Requirement: batchCommit Function
The system SHALL provide a batchCommit function for atomic multi-file commits.

#### Scenario: Function signature
- **GIVEN** the github.js module
- **WHEN** calling batchCommit
- **THEN** the signature is:
  ```javascript
  batchCommit(owner, repo, branch, changes, message)
  // changes = { creates: [], updates: [], deletes: [] }
  // returns { sha, stats: { created, updated, deleted } }
  ```

#### Scenario: Successful batch commit
- **GIVEN** valid owner, repo, branch, changes, and message
- **WHEN** calling batchCommit
- **THEN** a single commit is created
- **AND** the commit SHA is returned
- **AND** statistics are returned

#### Scenario: Authentication check
- **GIVEN** the user is not authenticated
- **WHEN** calling batchCommit
- **THEN** an error "Authentication required" is thrown

### Requirement: getBranchRef Helper
The system SHALL provide a helper to get branch reference SHA.

#### Scenario: Get branch ref
- **GIVEN** owner, repo, and branch name
- **WHEN** calling getBranchRef(owner, repo, branch)
- **THEN** the commit SHA of the branch head is returned

#### Scenario: Branch not found
- **GIVEN** a non-existent branch
- **WHEN** calling getBranchRef
- **THEN** an error is thrown

### Requirement: getTreeFromCommit Helper
The system SHALL provide a helper to get tree SHA from commit.

#### Scenario: Get tree SHA
- **GIVEN** a commit SHA
- **WHEN** calling getTreeFromCommit(owner, repo, commitSha)
- **THEN** the tree SHA is returned

### Requirement: createTree Helper
The system SHALL provide a helper to create a new tree.

#### Scenario: Create tree with changes
- **GIVEN** base tree SHA and tree entries
- **WHEN** calling createTree(owner, repo, baseTreeSha, entries)
- **THEN** a new tree is created
- **AND** the new tree SHA is returned

#### Scenario: Tree entry format
- **GIVEN** building tree entries
- **WHEN** creating the tree
- **THEN** entries follow GitHub format:
  - path: file path
  - mode: '100644' for files
  - type: 'blob'
  - content: base64 encoded (for create/update)
  - sha: null for delete, blob SHA for existing

### Requirement: createGitCommit Helper
The system SHALL provide a helper to create a git commit.

#### Scenario: Create commit
- **GIVEN** tree SHA, parent commit SHA, and message
- **WHEN** calling createGitCommit(owner, repo, treeSha, parentSha, message)
- **THEN** a new commit object is created
- **AND** the commit SHA is returned

### Requirement: updateBranchRef Helper
The system SHALL provide a helper to update branch reference.

#### Scenario: Update ref
- **GIVEN** branch name and new commit SHA
- **WHEN** calling updateBranchRef(owner, repo, branch, commitSha)
- **THEN** the branch points to the new commit

#### Scenario: Force update protection
- **GIVEN** the ref update API
- **WHEN** updating the ref
- **THEN** no force flag is used (safe update)
- **AND** concurrent modifications will fail safely

### Requirement: Cache Invalidation
The system SHALL invalidate relevant caches after batch commit.

#### Scenario: Clear affected caches
- **GIVEN** a successful batch commit
- **WHEN** the commit completes
- **THEN** caches for the following are cleared:
  - Repository contents
  - Repository tree
  - Repository commits
  - Branch information
