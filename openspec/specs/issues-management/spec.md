# Issues Management Specification

## Purpose

Full issue management including creating, viewing, closing, and commenting on issues.

---

## Requirements

### Requirement: List issues
The system SHALL allow listing repository issues.

#### Scenario: List open issues
- GIVEN the user is in a repository
- WHEN executing `issues`
- THEN all open issues are displayed
- AND each issue shows number, title, author, and status

#### Scenario: List all issues including closed
- GIVEN the user is in a repository
- WHEN executing `issues --all`
- THEN all issues (open and closed) are displayed

---

### Requirement: View issue details
The system SHALL allow viewing detailed issue information.

#### Scenario: View specific issue
- GIVEN issue #42 exists in the repository
- WHEN executing `issues view 42`
- THEN the issue details are displayed
- AND the title, body, author, status, and labels are shown
- AND the creation date is shown

#### Scenario: Issue not found
- GIVEN issue #999 does not exist
- WHEN executing `issues view 999`
- THEN an error "Issue not found" is displayed

---

### Requirement: Create issue
The system SHALL allow creating new issues.

#### Scenario: Create issue with flags
- GIVEN the user is authenticated
- AND the user is in a repository
- WHEN executing `issues create -t "Bug title" -b "Bug description"`
- THEN a new issue is created
- AND the issue number and URL are displayed

#### Scenario: Create issue without title
- GIVEN the user is authenticated
- WHEN executing `issues create -b "description only"`
- THEN an error "Issue title required" is displayed

#### Scenario: Create issue without auth
- GIVEN the user is not authenticated
- WHEN executing `issues create -t "Title" -b "Body"`
- THEN an error "Authentication required" is displayed

---

### Requirement: Close issue
The system SHALL allow closing issues.

#### Scenario: Close open issue
- GIVEN the user is authenticated
- AND issue #42 is open
- WHEN executing `issues close 42`
- THEN the issue is closed
- AND a success message is displayed

#### Scenario: Close already closed issue
- GIVEN issue #42 is already closed
- WHEN executing `issues close 42`
- THEN the issue state remains closed
- AND a message indicates it was already closed

---

### Requirement: Reopen issue
The system SHALL allow reopening closed issues.

#### Scenario: Reopen closed issue
- GIVEN the user is authenticated
- AND issue #42 is closed
- WHEN executing `issues reopen 42`
- THEN the issue is reopened
- AND a success message is displayed

---

### Requirement: Add comment to issue
The system SHALL allow adding comments to issues.

#### Scenario: Add comment to issue
- GIVEN the user is authenticated
- AND issue #42 exists
- WHEN executing `issues comment 42 "This is my comment"`
- THEN the comment is added
- AND a success message is displayed

#### Scenario: Comment on non-existent issue
- GIVEN issue #999 does not exist
- WHEN executing `issues comment 999 "comment"`
- THEN an error "Issue not found" is displayed

---

## Files

- `scripts/github.js` - fetchIssues, fetchIssue, createIssue, updateIssue, addIssueComment
- `scripts/commands.js` - cmdIssues, cmdIssuesView, cmdIssuesCreate, cmdIssuesClose, cmdIssuesComment

## Status

✅ Implemented in v2.4.0
