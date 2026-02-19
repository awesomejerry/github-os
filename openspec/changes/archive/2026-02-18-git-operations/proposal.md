## Why

Currently, the `branch` command only lists branches. Users cannot create new branches, delete branches, or switch between branches through the terminal interface. This limits the ability to manage repository branches without leaving the GitHub OS terminal.

## What Changes

- Extend `branch` command to support `-c <name>` flag for creating new branches
- Extend `branch` command to support `-d <name>` flag for deleting branches
- Add new `checkout <branch>` command to switch the current branch context
- Add new GitHub API functions: `createBranch`, `deleteBranch`, `getDefaultBranchSHA`
- Branch operations require authentication (OAuth)

## Capabilities

### New Capabilities
- `git-branch-operations`: Create, delete, and switch between Git branches via terminal commands

### Modified Capabilities
- None (existing `branch` command behavior extended, not changed)

## Impact

- `scripts/github.js`: Add `createBranch`, `deleteBranch`, `getDefaultBranchSHA` functions
- `scripts/commands.js`: Extend `cmdBranch` to handle `-c` and `-d` flags, add `cmdCheckout` command
- Requires authentication for write operations (create/delete)
