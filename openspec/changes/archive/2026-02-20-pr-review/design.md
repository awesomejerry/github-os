## Context

PR review functionality enables users to interact with GitHub Pull Request review system through the terminal interface. The implementation uses GitHub REST API v3 to fetch PR files, submit reviews, and add comments.

**Current State:**
- `scripts/github.js` provides API functions: `fetchPRFiles`, `createReview`, `fetchPRComments`, `addPRComment`
- `scripts/commands.js` provides CLI commands: `pr review`, `pr comments`, `pr comment`
- Tests exist in `tests/unit/pr-review.test.js`
- Spec exists in `openspec/specs/pr-command/spec.md`

## Goals / Non-Goals

**Goals:**
- Document the existing PR review implementation architecture
- Verify alignment between spec requirements and implementation
- Ensure test coverage for all scenarios

**Non-Goals:**
- Adding new features beyond what's specified
- Modifying existing API contracts
- Performance optimization

## Decisions

### API Layer Design
- **Decision:** Use GitHub REST API v3 endpoints directly
- **Rationale:** Simple, well-documented, no additional dependencies
- **Alternatives:** GraphQL API (more complex for simple operations)

### Review Event Types
- **Decision:** Support APPROVE, REQUEST_CHANGES, and COMMENT events
- **Rationale:** Covers all GitHub review states
- **Mapping:** `--approve` → APPROVE, `--request-changes` → REQUEST_CHANGES, `--comment "text"` → COMMENT

### Comment Types
- **Decision:** Fetch both review comments and issue comments, distinguish by `type` field
- **Rationale:** PRs can have both types; users want to see all feedback

### Authentication
- **Decision:** Require authentication for all write operations (approve, request-changes, comment)
- **Rationale:** GitHub API requires auth for write operations

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Large PRs may have many files | GitHub API paginates at 100 files; display truncates if needed |
| Rate limiting on API calls | Display rate limit info on error; cache results where possible |
| Comment body too long | Truncate display to 3 lines with "..." indicator |
