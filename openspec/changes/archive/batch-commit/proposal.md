## Why

Current file operations (touch, mkdir, rm, mv, cp, edit) create individual commits for each operation. When a user wants to make multiple related changes, they cannot group them into a single commit. This limits the ability to organize logical changes together.

GitHub's Contents API creates one commit per file operation. To enable batch commits, we need to use the Git Data API which allows creating a single commit with multiple tree entries.

## What Changes

- Add `batchCommit()` function in github.js using GitHub Git Data API
- Add staging module (staging.js) to track pending file changes
- Modify `commit` command to support `-m "message"` for batch operations
- Add new `diff` command to display staged changes
- Add `add` command to stage file changes

### cmdCommit behavior
1. Check for `-m "message"` flag
2. Get staged changes from staging module
3. Execute batch commit via Git Data API
4. Clear staging area
5. Display commit SHA and statistics

### cmdDiff behavior
- Display staged changes in unified diff format
- Show additions/deletions count

## Capabilities

### New Capabilities
- `batch-commit`: Single commit with multiple file changes using Git Data API
- `staging-area`: Track pending file operations before commit

### Modified Capabilities
- `github-api`: Add batchCommit function using Git Data API
- `commands`: Add commit -m, diff, add commands

## Impact

- **scripts/github.js**: Add batchCommit function
- **scripts/staging.js** (NEW): Staging area management
- **scripts/commands.js**: Add add, diff commands; modify commit behavior
- **scripts/app.js**: Import staging module
