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
