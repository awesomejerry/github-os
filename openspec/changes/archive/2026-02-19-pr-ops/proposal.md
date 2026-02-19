## Why

The current CLI implementation supports viewing PRs but lacks the ability to create, merge, or close pull requests. This prevents users from completing their full PR workflow through the CLI, forcing them to switch to GitHub's web interface for these critical operations. Implementing PR operations will enable a complete end-to-end PR management experience.

## What Changes

- **New**: `createPR()` function in github.js to create pull requests via GitHub API
- **New**: `mergePR()` function in github.js to merge pull requests via GitHub API
- **New**: `closePR()` function in github.js to close pull requests via GitHub API
- **Modified**: Expand `cmdPr()` in commands.js to support `create`, `merge`, and `close` subcommands
- **New**: Interactive PR creation mode (prompts for title/body when not provided)
- **New**: Direct PR creation mode (accepts title/body via flags)
- **New**: Confirmation prompts for merge and close operations (safety requirement)
- **New**: Comprehensive error handling for GitHub API responses
- **New**: Authorization header support for authenticated API calls

## Capabilities

### New Capabilities
- `pr-operations`: Complete pull request lifecycle management including create, merge, and close operations with interactive and direct modes, confirmation flows for destructive operations, and full GitHub API integration

### Modified Capabilities
- (None - this is a new feature)

## Impact

**Affected Code**:
- `scripts/github.js` - Add three new functions: `createPR()`, `mergePR()`, `closePR()`
- `scripts/commands.js` - Expand `cmdPr()` to handle subcommands and user confirmations
- `scripts/output.js` - May need new formatting functions for PR operation results

**API Dependencies**:
- GitHub REST API v3 endpoints:
  - `POST /repos/{owner}/{repo}/pulls` (create PR)
  - `PUT /repos/{owner}/{repo}/pulls/{number}/merge` (merge PR)
  - `PATCH /repos/{owner}/{repo}/pulls/{number}` (close PR)
- Requires authentication token for all operations

**User Experience**:
- Users can now complete full PR workflows without leaving the CLI
- Interactive prompts for missing information (title, body)
- Safety confirmations for destructive operations (merge, close)
- Clear success/error messaging
