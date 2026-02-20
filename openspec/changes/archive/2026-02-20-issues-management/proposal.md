## Why

Users need comprehensive issue management capabilities beyond just listing issues. Currently, the `issues` command only supports viewing issues. This change adds the ability to create, close, reopen, view details, and comment on issues - enabling full issue workflow management from the terminal.

## What Changes

- Add `issues view <number>` - View issue details
- Add `issues create` - Interactive issue creation (prompts for title/body)
- Add `issues create -t "title" -b "body"` - Direct issue creation with flags
- Add `issues close <number>` - Close an open issue (requires confirmation)
- Add `issues reopen <number>` - Reopen a closed issue (requires confirmation)
- Add `issues comment <number> "text"` - Add comment to an issue
- Add `fetchIssue` function to github.js - Fetch single issue details
- Add `createIssue` function to github.js - Create new issue
- Add `updateIssue` function to github.js - Update issue state (close/reopen)
- Add `addIssueComment` function to github.js - Add comment to issue

## Capabilities

### New Capabilities

- `issues-management`: Full issue management including view, create, close, reopen, and comment operations

### Modified Capabilities

- `issues-command`: Extends existing issues command with subcommands (view, create, close, reopen, comment)
- `github-api`: Adds new issue API functions (fetchIssue, createIssue, updateIssue, addIssueComment)

## Impact

- **scripts/github.js**: Add 4 new API functions
- **scripts/commands.js**: Extend cmdIssues with subcommand handling
- **tests/unit/issues.test.js**: New unit tests for issue API functions
- **tests/integration/issues-command.test.js**: New integration tests for issue commands
