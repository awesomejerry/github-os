# pr-review Specification

## Purpose

Provide PR review API functions for GitHub OS terminal, including fetching PR files, creating reviews, and managing comments.

## ADDED Requirements

### Requirement: Fetch PR Files
The system SHALL provide a `fetchPRFiles` function to retrieve files changed in a PR.

#### Scenario: Fetch files successfully
- **GIVEN** a valid owner, repo, and PR number
- **WHEN** calling `fetchPRFiles(owner, repo, number)`
- **THEN** an array of file objects is returned with filename, status, additions, deletions, changes, and blob_url

#### Scenario: PR not found
- **GIVEN** a non-existent PR number
- **WHEN** calling `fetchPRFiles(owner, repo, 999)`
- **THEN** an error "PR #999 not found" is thrown

#### Scenario: Caching
- **GIVEN** files have been fetched for a PR
- **WHEN** calling `fetchPRFiles` again with same parameters
- **THEN** cached results are returned without API call

### Requirement: Create Review
The system SHALL provide a `createReview` function to submit PR reviews.

#### Scenario: Create approving review
- **GIVEN** user is authenticated
- **WHEN** calling `createReview(owner, repo, number, 'APPROVE', body)`
- **THEN** a review with state APPROVED is created
- **AND** review id, state, body, and html_url are returned

#### Scenario: Request changes review
- **GIVEN** user is authenticated
- **WHEN** calling `createReview(owner, repo, number, 'REQUEST_CHANGES', body)`
- **THEN** a review with state CHANGES_REQUESTED is created

#### Scenario: Comment-only review
- **GIVEN** user is authenticated
- **WHEN** calling `createReview(owner, repo, number, 'COMMENT', body)`
- **THEN** a review with state COMMENTED is created

#### Scenario: Review requires authentication
- **GIVEN** user is not authenticated
- **WHEN** calling `createReview`
- **THEN** an error "Authentication required" is thrown

#### Scenario: Review permission denied
- **GIVEN** user lacks permission
- **WHEN** calling `createReview`
- **THEN** an error "Permission denied" is thrown

#### Scenario: PR not found for review
- **GIVEN** a non-existent PR number
- **WHEN** calling `createReview`
- **THEN** an error "PR #number not found" is thrown

#### Scenario: Validation error
- **GIVEN** invalid review data
- **WHEN** calling `createReview`
- **THEN** the API error message is thrown

### Requirement: Fetch PR Comments
The system SHALL provide a `fetchPRComments` function to retrieve all PR comments.

#### Scenario: Fetch all comments
- **GIVEN** a valid owner, repo, and PR number
- **WHEN** calling `fetchPRComments(owner, repo, number)`
- **THEN** both review comments and issue comments are fetched
- **AND** comments are merged and sorted by creation date
- **AND** each comment includes id, type, user, body, created_at, html_url

#### Scenario: Review comments include path
- **GIVEN** review comments exist on specific files
- **WHEN** fetching PR comments
- **THEN** review comments include the file path

#### Scenario: Empty comments
- **GIVEN** a PR with no comments
- **WHEN** calling `fetchPRComments`
- **THEN** an empty array is returned

### Requirement: Add PR Comment
The system SHALL provide an `addPRComment` function to add general comments to PRs.

#### Scenario: Add comment successfully
- **GIVEN** user is authenticated
- **WHEN** calling `addPRComment(owner, repo, number, body)`
- **THEN** a comment is added to the PR
- **AND** comment id, body, user, created_at, html_url are returned

#### Scenario: Comment requires authentication
- **GIVEN** user is not authenticated
- **WHEN** calling `addPRComment`
- **THEN** an error "Authentication required" is thrown

#### Scenario: Comment permission denied
- **GIVEN** user lacks permission
- **WHEN** calling `addPRComment`
- **THEN** an error "Permission denied" is thrown

#### Scenario: PR not found for comment
- **GIVEN** a non-existent PR number
- **WHEN** calling `addPRComment`
- **THEN** an error "PR #number not found" is thrown
