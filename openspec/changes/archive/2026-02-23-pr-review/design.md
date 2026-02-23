## Context

The GitHub OS terminal already supports basic PR operations (create, merge, close). Users need to perform code reviews directly from the terminal, including viewing changed files, approving/rejecting PRs, and adding comments.

The implementation integrates with:
- **session.js**: For authentication state
- **github.js**: For GitHub API calls
- **commands.js**: For command dispatch

## Goals / Non-Goals

**Goals:**
- Enable viewing PR file changes for review
- Support approve/request-changes/comment review actions
- List all PR comments (both review and issue comments)
- Add general comments to PRs

**Non-Goals:**
- Inline code comments on specific lines (requires complex diff navigation)
- Review templates or checklists
- Batch review operations across multiple PRs

## Decisions

### 1. Command Structure
**Decision**: Use subcommand pattern `pr review <number> [options]`
**Rationale**: Consistent with existing `pr create`, `pr merge`, `pr close` pattern

### 2. Review API Endpoints
**Decision**: Use `/repos/{owner}/{repo}/pulls/{number}/reviews` for reviews
**Rationale**: This is the standard GitHub API for creating reviews with APPROVE, REQUEST_CHANGES, or COMMENT events

### 3. Comments Retrieval
**Decision**: Fetch both review comments and issue comments, merge and sort by date
**Rationale**: PRs can have two types of comments - review comments (on specific code) and issue comments (general). Both should be visible.

### 4. Comment vs Review Comment
**Decision**: `pr comment` adds issue comments, `pr review --comment` adds review comments
**Rationale**: Matches GitHub's distinction between general discussion and review feedback

## Risks / Trade-offs

- **Rate Limiting**: Multiple API calls for comments → Use caching in github.js
- **Large PRs**: Many files may overwhelm display → Limit to 100 files per PR
- **Auth Required**: All review actions need authentication → Clear error messages
