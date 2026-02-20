## Context

The GitHub OS terminal currently has a basic `issues` command that only lists issues. Users need full issue management capabilities including creating, viewing details, closing, reopening, and commenting. All operations that modify state require authentication.

## Goals / Non-Goals

**Goals:**
- Add subcommand structure to `issues` command (view, create, close, reopen, comment)
- Implement GitHub API functions for issue operations
- Provide both interactive and direct flag-based workflows
- Add confirmation prompts for destructive actions (close, reopen)
- Follow existing command patterns (similar to PR operations)

**Non-Goals:**
- Issue editing (title/body modification)
- Label management
- Assignee management
- Milestone management

## Decisions

### Command Structure
Follow the PR command pattern with subcommands:
- `issues` (no args) → list open issues (existing behavior)
- `issues --all` → list all issues (existing behavior)
- `issues view <number>` → show issue details
- `issues create [-t "title"] [-b "body"]` → create issue
- `issues close <number>` → close issue (with confirmation)
- `issues reopen <number>` → reopen issue (with confirmation)
- `issues comment <number> "text"` → add comment

### API Functions
Add to github.js:
```javascript
fetchIssue(owner, repo, number)         // GET /repos/{owner}/{repo}/issues/{number}
createIssue(owner, repo, title, body)   // POST /repos/{owner}/{repo}/issues
updateIssue(owner, repo, number, state) // PATCH /repos/{owner}/{repo}/issues/{number}
addIssueComment(owner, repo, number, body) // POST /repos/{owner}/{repo}/issues/{number}/comments
```

### Authentication Flow
All write operations (create, close, reopen, comment) check `session.isAuthenticated()` first. If not authenticated, display error message prompting user to login.

### Interactive vs Direct Mode
- `issues create` without flags → interactive mode (prompt for title, then body)
- `issues create -t "title" -b "body"` → direct mode (no prompts)
- This matches the PR create pattern

## Risks / Trade-offs

- **Rate limiting**: Issue operations count against GitHub API rate limit. Mitigation: Show rate limit in status command.
- **Large issue bodies**: Body text can be lengthy. Mitigation: Display truncated in list, full in view.
- **Concurrent modifications**: Issue state might change between fetch and update. Mitigation: Accept eventual consistency (no optimistic locking).
