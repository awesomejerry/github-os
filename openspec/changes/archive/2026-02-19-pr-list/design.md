## Context

GitHub OS terminal currently supports issues, releases, contributors, and log commands for repository exploration. PR viewing is a natural addition to support code review workflows. The implementation follows the existing patterns established by issues-command.

## Goals / Non-Goals

**Goals:**
- Add `pr` command to list PRs with state filtering
- Add `pr view <number>` to view PR details
- Follow existing command patterns (issues, releases)

**Non-Goals:**
- Creating/editing PRs (write operations)
- PR merge functionality
- PR review commenting

## Decisions

1. **API Functions**: Add `fetchPRs(owner, repo, state)` and `fetchPR(owner, repo, number)` to github.js, following the pattern of `fetchRepoIssues`.

2. **Output Format**: Use format similar to issues command:
   - List: `#123 Title @author [labels] (relative-date)`
   - View: Multi-line with title, state, author, base/head branches, body

3. **State Filtering**: Use `--all` for all states (open/closed), default to open only.

## Risks / Trade-offs

- Large PR lists may be slow → Use pagination (per_page=30)
- PR body may be very long → Truncate view to first 500 chars if too long
