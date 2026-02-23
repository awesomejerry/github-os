## Why

The PR review functionality allows users to view PR diffs, approve/reject PRs, and add comments. This capability already exists in the codebase but needs formal OpenSpec documentation to ensure requirements are properly captured and verified.

## What Changes

- Document existing PR review commands: `pr review`, `pr comments`, `pr comment`
- Document existing GitHub API functions: `fetchPRFiles`, `createReview`, `addPRComment`
- Verify existing tests cover all spec requirements

## Capabilities

### New Capabilities
(None - all capabilities already exist)

### Modified Capabilities
- `pr-command`: Add delta spec to verify PR review functionality matches spec requirements

## Impact

- `scripts/github.js` - No changes (already has `fetchPRFiles`, `createReview`, `addPRComment`)
- `scripts/commands.js` - No changes (already has `cmdPrReview`, `cmdPrComments`, `cmdPrComment`)
- `tests/unit/pr-review.test.js` - No changes (tests already exist)
- `openspec/specs/pr-command/spec.md` - Already exists with review requirements
