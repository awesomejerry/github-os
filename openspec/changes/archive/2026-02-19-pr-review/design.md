## Context

The GitHub OS terminal currently supports basic PR operations (list, view, create, merge, close) but lacks review functionality. Users must leave the terminal to review PRs on GitHub's web interface. This design extends the existing `pr` command to support the full review workflow.

## Goals / Non-Goals

**Goals:**
- Enable viewing PR files for review
- Submit PR reviews (approve, request changes, comment)
- View and add PR comments
- Maintain consistent command signature `(terminal, githubUser, args)`

**Non-Goals:**
- Inline code suggestions on specific lines (future enhancement)
- Review templates or checklists
- Multi-reviewer workflows

## Decisions

### Command Structure
Use subcommands under existing `pr` command:
- `pr review <number>` - View PR files
- `pr review <number> --approve` - Approve PR
- `pr review <number> --request-changes` - Request changes
- `pr review <number> --comment "text"` - Add review comment
- `pr comments <number>` - List comments
- `pr comment <number> "text"` - Add general comment

**Rationale**: Follows existing `pr create/merge/close` pattern. Using `review` subcommand groups review-related actions.

### API Functions
Add four new functions to `scripts/github.js`:
- `fetchPRFiles(owner, repo, number)` - GET /repos/{owner}/{repo}/pulls/{number}/files
- `createReview(owner, repo, number, event, body)` - POST /repos/{owner}/{repo}/pulls/{number}/reviews
- `fetchPRComments(owner, repo, number)` - GET /repos/{owner}/{repo}/pulls/{number}/comments
- `addPRComment(owner, repo, number, body)` - POST /repos/{owner}/{repo}/pulls/{number}/comments

**Rationale**: Follows existing API function patterns in github.js (caching, error handling, auth checks).

### Authentication Requirement
Review actions (`--approve`, `--request-changes`) require authentication via `session.isAuthenticated()`.

**Rationale**: GitHub API requires write permissions for review submissions.

## Risks / Trade-offs

- **Large PRs may timeout**: Fetching many files could be slow → Limit display to first 50 files, show summary
- **Comment formatting**: Plain text only in terminal → Accept limitation, future markdown rendering
