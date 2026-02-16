## Why

Users browsing GitHub repositories in the terminal need to see all available branches to understand project structure and identify different development streams. Currently, there is no way to list branches without leaving the terminal to visit GitHub's web interface.

## What Changes

- Add new `branch` command to display all branches in the current repository
- Mark the default branch with an asterisk (*)
- Show current branch indicator if available
- Use GitHub REST API to fetch branch data

## Capabilities

### New Capabilities

- `branch-command`: Display all branches for the current repository

### Modified Capabilities

- `commands`: Add `branch` command to the commands specification
- `github-api`: Add branch fetching capability to support the branch command

## Impact

- New `branch` command handler in command system
- New API function to fetch repository branches from GitHub
- Updates to help text to document the new command
