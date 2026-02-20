## Context

The Issues Management feature enables CLI interaction with GitHub Issues. The implementation already exists - this change verifies completeness and ensures all specs are satisfied.

Current state:
- `fetchIssue`, `fetchRepoIssues`, `createIssue`, `updateIssue`, `addIssueComment` in scripts/github.js
- `cmdIssues` and subcommands in scripts/commands.js
- 20 unit tests passing in tests/unit/issues.test.js

## Goals / Non-Goals

**Goals:**
- Verify implementation matches specs
- Ensure proper authentication checks
- Confirm test coverage

**Non-Goals:**
- New features beyond existing specs
- UI/UX changes

## Decisions

1. **API function names**: Use existing names (fetchRepoIssues, fetchIssue, createIssue, updateIssue, addIssueComment) - consistent with GitHub API patterns
2. **Command signature**: `(terminal, githubUser, args)` - matches existing command convention
3. **Auth pattern**: Check `session.isAuthenticated()` before write operations
4. **Cache invalidation**: Clear related cache entries on updateIssue

## Risks / Trade-offs

- **Risk**: Spec drift from implementation → Verify by running tests
- **Risk**: Missing edge cases → Review spec scenarios against implementation
