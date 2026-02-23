## Why

Users need to review pull requests directly from the GitHub OS terminal interface. Currently, the `pr` command only supports listing, viewing, creating, merging, and closing PRs, but lacks review functionality (approve, request changes, comment). This prevents users from completing their PR workflow without leaving the terminal.

## What Changes

- Add `pr review <number>` - View PR files and details for review
- Add `pr review <number> --approve` - Submit an approving review
- Add `pr review <number> --request-changes` - Submit a review requesting changes
- Add `pr review <number> --comment "text"` - Submit a review comment
- Add `pr comments <number>` - List PR review comments
- Add `pr comment <number> "text"` - Add a general PR comment

## Capabilities

### New Capabilities

- `pr-review`: PR review commands (approve, request changes, review comments)

### Modified Capabilities

- `pr-command`: Extend existing PR command with review subcommands

## Impact

- `scripts/github.js` - Add fetchPRFiles, createReview, fetchPRComments, addPRComment API functions
- `scripts/commands.js` - Extend cmdPr with review, comments, comment subcommands
- `tests/unit/pr-review.test.js` - New unit tests for review functionality
