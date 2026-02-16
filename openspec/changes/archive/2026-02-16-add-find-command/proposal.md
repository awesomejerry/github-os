## Why

Users cannot search for files by name pattern across the repository. They must manually navigate directories with `ls` and `cd` to locate files, which is inefficient for large repositories.

## What Changes

- Add new `find` command to search for files by name pattern
- Add `fetchRepoTree()` API function to get repository file tree
- Support wildcard patterns (`*`, `?`)
- Case-insensitive matching

## Capabilities

### New Capabilities

- `find-command`: Find files matching a pattern across the entire repository

### Modified Capabilities

- `commands`: Add `find` command to the commands specification
- `github-api`: Add tree fetching capability

## Impact

- New `find` command handler in command system
- New API function to fetch repository tree from GitHub
- Updates to help text to document the new command
