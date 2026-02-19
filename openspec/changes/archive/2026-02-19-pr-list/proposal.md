## Why

Users need to view and explore Pull Requests within the GitHub OS terminal. Currently, the terminal supports issues, releases, and contributors, but lacks PR viewing functionality. This is essential for code review workflows and understanding repository activity.

## What Changes

- Add `pr` command to list open pull requests
- Add `pr --all` flag to list all PRs (including closed/merged)
- Add `pr view <number>` command to view PR details
- Add `fetchPRs()` and `fetchPR()` API functions to github.js
- Register `pr` command in commands registry

## Capabilities

### New Capabilities
- `pr-command`: Pull Request list and view functionality with state filtering and detailed view

### Modified Capabilities
- `commands`: Add pr command registration and tab completion

## Impact

- `scripts/github.js`: Add fetchPRs, fetchPR functions
- `scripts/commands.js`: Add cmdPr function, register in commands object
- Tab completion: Add 'pr' to command list
