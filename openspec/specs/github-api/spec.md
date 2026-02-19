# GitHub API Specification

## Purpose

The GitHub API module handles all interactions with the GitHub REST API for fetching repository data and file contents.

---
## Requirements
### Requirement: Auto-Detect GitHub User
The system SHALL automatically detect the GitHub username from the hosting URL.

#### Scenario: GitHub Pages hosting
- GIVEN the application is hosted on `*.github.io`
- WHEN the application loads
- THEN the username is extracted from the hostname

#### Scenario: Local or other hosting
- GIVEN the application is not hosted on GitHub Pages
- WHEN the application loads
- THEN the default user from configuration is used

---

### Requirement: Fetch User Repositories
The system SHALL fetch public repositories for a GitHub user.

#### Scenario: Successful fetch
- GIVEN a valid GitHub username
- WHEN fetching repositories
- THEN up to 100 repositories are returned
- AND repositories are sorted by last updated
- AND each repo includes: name, description, stars, forks, language

#### Scenario: User not found
- GIVEN an invalid GitHub username
- WHEN fetching repositories
- THEN an error "User not found" is raised

#### Scenario: Caching
- GIVEN repositories have been fetched for a user
- WHEN requesting the same user's repos again
- THEN cached data is returned without API call

---

### Requirement: Fetch Repository Contents
The system SHALL fetch contents of a repository path.

#### Scenario: Directory contents
- GIVEN a valid owner, repo, and path
- WHEN the path is a directory
- THEN an array of items is returned
- AND each item includes: name, type (file/dir), size

#### Scenario: Path not found
- GIVEN an invalid path
- WHEN fetching contents
- THEN an error "Path not found" is raised

#### Scenario: Caching
- GIVEN contents have been fetched for a path
- WHEN requesting the same path again
- THEN cached data is returned

---

### Requirement: Fetch File Content
The system SHALL fetch and decode file contents.

#### Scenario: Text file
- GIVEN a valid file path
- WHEN fetching the file
- THEN the base64 content is decoded
- AND the file name and content are returned

#### Scenario: File not found
- GIVEN an invalid file path
- WHEN fetching the file
- THEN an error "File not found" is raised

#### Scenario: Large files
- GIVEN a file larger than 1MB
- WHEN fetching the file
- THEN an error is raised (GitHub API limit)

---

### Requirement: Fetch Repository Info
The system SHALL fetch repository metadata.

#### Scenario: Successful fetch
- GIVEN a valid owner and repo
- WHEN fetching info
- THEN repository details are returned:
  - name, full_name, description
  - stars, forks, watchers
  - language, topics, license
  - created_at, updated_at
  - homepage, html_url

---

### Requirement: Search Code (Limited)
The system SHALL support code search via GitHub API.

#### Scenario: Authentication required
- GIVEN an unauthenticated request
- WHEN searching code
- THEN an error indicates authentication is required
- AND a GitHub search URL is provided as fallback

#### Scenario: Rate limiting
- GIVEN the API rate limit is exceeded
- WHEN making any API call
- THEN an appropriate error message is displayed

---

### Requirement: Cache Management
The system SHALL manage API response caching.

#### Scenario: Cache retrieval
- GIVEN data has been fetched
- WHEN the same request is made
- THEN cached data is returned without new API call

#### Scenario: Clear user cache
- GIVEN switching to a new GitHub user
- WHEN `clearUserCache` is called
- THEN all cached data for the previous user is removed

---

### Requirement: Fetch Repository Commits
The system SHALL fetch commit history for a repository.

#### Scenario: Successful fetch
- **GIVEN** a valid owner and repo
- **WHEN** fetching commits with a count
- **THEN** up to the requested number of commits are returned
- **AND** each commit includes: sha, author name, date, and message

#### Scenario: Empty repository
- **GIVEN** a repository with no commits
- **WHEN** fetching commits
- **THEN** an empty array is returned

#### Scenario: Caching
- **GIVEN** commits have been fetched for a repository
- **WHEN** requesting the same commits again
- **THEN** cached data is returned without new API call

#### Scenario: API error
- **GIVEN** the GitHub API returns an error
- **WHEN** fetching commits
- **THEN** an appropriate error is raised

### Requirement: Rate Limit Detection
The system SHALL detect and notify users of GitHub API rate limits.

#### Scenario: Rate limit exceeded
- **GIVEN** the GitHub API returns 403 Forbidden
- **AND** X-RateLimit-Remaining header is 0
- **WHEN** an API call fails
- **THEN** a user-friendly message is displayed
- **AND** the message includes estimated time until reset

#### Scenario: Normal API response
- **GIVEN** the GitHub API returns a normal response
- **WHEN** an API call succeeds
- **THEN** no rate limit message is shown

### Requirement: Create File
The system SHALL allow creating new files via GitHub Contents API.

#### Scenario: Create file successfully
- **GIVEN** valid authentication token
- **AND** valid owner, repo, and path
- **WHEN** calling createFile(owner, repo, path, content, message)
- **THEN** a PUT request is sent to `/repos/{owner}/{repo}/contents/{path}`
- **AND** content is base64 encoded
- **AND** the commit SHA is returned

#### Scenario: Authentication error
- **GIVEN** invalid or expired token
- **WHEN** calling createFile
- **THEN** an error "Authentication required" is raised

#### Scenario: Permission denied
- **GIVEN** user lacks write access to repository
- **WHEN** calling createFile
- **THEN** an error "Permission denied" is raised

---

### Requirement: Get File with SHA
The system SHALL allow fetching file metadata including SHA hash.

#### Scenario: Get file metadata
- **GIVEN** valid owner, repo, and file path
- **WHEN** calling getFile(owner, repo, path)
- **THEN** file metadata is returned including: name, content (decoded), sha, type
- **AND** authentication header is included if session exists

#### Scenario: File not found
- **GIVEN** invalid file path
- **WHEN** calling getFile
- **THEN** an error "File not found" is raised

---

### Requirement: Delete File
The system SHALL allow deleting files via GitHub Contents API.

#### Scenario: Delete file successfully
- **GIVEN** valid authentication token
- **AND** valid file SHA
- **WHEN** calling deleteFile(owner, repo, path, sha, message)
- **THEN** a DELETE request is sent with SHA in body
- **AND** the commit SHA is returned

#### Scenario: SHA mismatch conflict
- **GIVEN** outdated SHA (file modified since fetch)
- **WHEN** calling deleteFile
- **THEN** an error indicating conflict is raised

---

### Requirement: Update File
The system SHALL allow updating existing files via GitHub Contents API.

#### Scenario: Update file successfully
- **GIVEN** valid authentication token
- **AND** valid file SHA
- **WHEN** calling updateFile(owner, repo, path, content, sha, message)
- **THEN** a PUT request with SHA in body is sent
- **AND** the new commit SHA is returned

#### Scenario: SHA mismatch conflict
- **GIVEN** outdated SHA
- **WHEN** calling updateFile
- **THEN** an error indicating conflict is raised

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

## API Constraints

### Rate Limits
- Unauthenticated requests: 60 requests/hour per IP
- Code search requires authentication

### Size Limits
- File contents: Max 1MB
- Repository listing: Max 100 per request

### Content Types
- Only public repositories are accessible
- Binary files cannot be displayed properly
