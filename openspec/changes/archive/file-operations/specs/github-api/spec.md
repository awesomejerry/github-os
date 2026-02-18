## ADDED Requirements

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
