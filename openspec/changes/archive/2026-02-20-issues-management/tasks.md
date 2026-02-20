## 1. GitHub API Functions

- [x] 1.1 Add fetchIssue(owner, repo, number) function to scripts/github.js
- [x] 1.2 Add createIssue(owner, repo, title, body) function to scripts/github.js
- [x] 1.3 Add updateIssue(owner, repo, number, state) function to scripts/github.js
- [x] 1.4 Add addIssueComment(owner, repo, number, body) function to scripts/github.js
- [x] 1.5 Export new functions in github.js

## 2. Command Implementation

- [x] 2.1 Refactor cmdIssues to handle subcommands (view, create, close, reopen, comment)
- [x] 2.2 Implement cmdIssuesView function
- [x] 2.3 Implement cmdIssuesCreate function with interactive and flag modes
- [x] 2.4 Implement cmdIssuesClose function with confirmation
- [x] 2.5 Implement cmdIssuesReopen function with confirmation
- [x] 2.6 Implement cmdIssuesComment function
- [x] 2.7 Add authentication checks to all write operations

## 3. Unit Tests

- [x] 3.1 Create tests/unit/issues.test.js
- [x] 3.2 Add tests for fetchIssue function
- [x] 3.3 Add tests for createIssue function
- [x] 3.4 Add tests for updateIssue function
- [x] 3.5 Add tests for addIssueComment function

## 4. Integration Tests

- [x] 4.1 Create tests/integration/issues-command.test.js
- [x] 4.2 Add tests for issues view command
- [x] 4.3 Add tests for issues create command
- [x] 4.4 Add tests for issues close command
- [x] 4.5 Add tests for issues reopen command
- [x] 4.6 Add tests for issues comment command
- [x] 4.7 Add tests for authentication requirements

## 5. Documentation

- [x] 5.1 Update help text in cmdHelp to include new issue subcommands
