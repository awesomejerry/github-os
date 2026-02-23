## Context

GitHub OS Terminal currently provides navigation, file operations, issue management, and PR workflows. Users need visibility into their notifications and GitHub Actions workflows without leaving the terminal. This feature follows the existing command patterns in commands.js and uses the established API layer in github.js.

## Goals / Non-Goals

**Goals:**
- Implement `notifications` command with `--all` and `--mark-read` flags
- Implement `actions` command with `view`, `rerun` subcommands and `--repo` flag
- Follow existing command patterns (cmdIssues, cmdPr) for consistency
- Add appropriate API functions to github.js
- Handle authentication requirements gracefully
- Provide formatted, user-friendly output matching shared-decisions spec

**Non-Goals:**
- Real-time notification streaming
- Actions workflow creation/editing
- Self-hosted runner management
- Notification filtering by type/repository

## Decisions

### Command Structure
- Use subcommand pattern for `actions` (similar to `issues` command)
- Use flags for `notifications` (simpler, fewer subcommands needed)
- Both commands require repository context (must be in a repo for actions)

### Output Format
- Follow shared-decisions-phase9-10.md output format exactly
- Use emoji indicators: 🔔 for issues, ✅ for success, ❌ for failure, 🔄 for in-progress
- Show relative timestamps using existing `formatRelativeDate` utility

### API Error Handling
- Check authentication before API calls, show clear "login required" message
- Handle rate limiting gracefully (reuse existing checkRateLimit pattern)
- For actions logs: limit output to prevent terminal overflow (show first 100 lines with truncation notice)

### Actions Logs Strategy
- Fetch logs as zip archive from GitHub API
- Parse and display job steps with status indicators
- Handle large logs by truncating with "... (truncated, use GitHub UI for full logs)"

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Actions logs can be very large | Limit output to 100 lines, show truncation notice with GitHub URL |
| Notifications API can be slow | Use loading indicator, cache recent results |
| Missing repo scope shows cryptic errors | Pre-check scope in status command, show helpful message |
| Log parsing complexity (zip format) | Use simple text extraction, handle binary gracefully |
