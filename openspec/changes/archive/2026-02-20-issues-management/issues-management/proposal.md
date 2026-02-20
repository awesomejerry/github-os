## Why

Implement the Issue Management feature to allow users to interact with GitHub Issues through the CLI. The specs already exist and need to be fully implemented and tested.

## What Changes

- Implement `fetchIssues` function for listing issues (may be missing)
- Verify `cmdIssues` command handles all subcommands correctly
- Ensure proper authentication checks for write operations
- Add/update unit tests for all issue operations

## Capabilities

### New Capabilities
- None (all capabilities already specified in existing specs)

### Modified Capabilities
- `issues-command`: Implementation verification - ensuring all command scenarios work
- `issues-management`: Implementation verification - ensuring API functions and subcommands work

## Impact

- `scripts/github.js` - verify/add fetchIssues function
- `scripts/commands.js` - verify cmdIssues and subcommands
- `tests/unit/issues.test.js` - verify complete test coverage
