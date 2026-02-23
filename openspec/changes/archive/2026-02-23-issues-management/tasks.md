## 1. Update GitHub API Functions

- [x] 1.1 Update `fetchRepoIssues` to include `comments` and `updated_at` in response
- [x] 1.2 Verify `fetchIssue` already includes all required fields

## 2. Update Issues List Output Format

- [x] 2.1 Update `listIssues` function to use Phase 10 multi-line format
- [x] 2.2 Add status line with state, comments count, and updated time
- [x] 2.3 Ensure proper formatting for labels display

## 3. Update Tests

- [x] 3.1 Update unit tests for `fetchRepoIssues` to verify new fields
- [x] 3.2 Update integration tests for issues command output format
- [x] 3.3 Run all tests to ensure no regressions

## 4. Verify All Issues Commands

- [x] 4.1 Verify `issues` lists open issues with new format
- [x] 4.2 Verify `issues --all` lists all issues including closed
- [x] 4.3 Verify `issues view <number>` shows full details
- [x] 4.4 Verify `issues create` works with -t/-b flags
- [x] 4.5 Verify `issues close <number>` requires confirmation
- [x] 4.6 Verify `issues reopen <number>` requires confirmation
- [x] 4.7 Verify `issues comment <number> "text"` adds comments
