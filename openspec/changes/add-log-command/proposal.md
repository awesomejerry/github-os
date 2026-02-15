## Why

Users browsing GitHub repositories in the terminal need to see recent commit history to understand project activity, track changes, and review contributions. Currently, there is no way to view commit history without leaving the terminal to visit GitHub's web interface.

## What Changes

- Add new `log` command to display recent commits for the current repository
- Accept optional count parameter (e.g., `log 20`) with default of 10 commits
- Display commit hash, author, date, and message for each commit
- Use GitHub REST API to fetch commit data

## Capabilities

### New Capabilities

- `log-command`: Display recent commit history for the current repository

### Modified Capabilities

- `commands`: Add `log` command to the commands specification
- `github-api`: Add commit fetching capability to support the log command

## Impact

- New `log` command handler in command system
- New API function to fetch repository commits from GitHub
- Updates to help text to document the new command
