## Why

Users need the ability to review pull requests directly from the terminal interface. Currently, users can only view, create, merge, and close PRs but cannot perform code reviews, add review comments, or approve/request changes on PRs. This limits the utility of the GitHub OS terminal for code review workflows.

## What Changes

- Add `pr review <number>` command to view PR files for review
- Add `pr review <number> --approve` command to approve a PR
- Add `pr review <number> --request-changes` command to request changes
- Add `pr review <number> --comment "text"` command to add review comments
- Add `pr comments <number>` command to list all PR comments (both review and issue comments)
- Add `pr comment <number> "text"` command to add general comments to a PR

## Capabilities

### New Capabilities
- `pr-review`: PR review commands for viewing, approving, requesting changes, and commenting on PRs

### Modified Capabilities
- `pr-command`: Extended to include review, comments, and comment subcommands

## Impact

- **scripts/commands.js**: Add cmdPrReview, cmdPrComments, cmdPrComment functions
- **scripts/github.js**: Add createReview, fetchPRComments, addPRComment, fetchPRFiles API functions
- **tests/unit/pr-review.test.js**: Unit tests for PR review operations
