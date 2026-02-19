## Why

Currently, all write operations (touch, mkdir, rm, mv, cp, edit) immediately commit changes to GitHub. This is inefficient for multiple file operations as each creates a separate commit. Users need a staging mechanism similar to Git's staging area to batch multiple changes into a single commit.

## What Changes

- **BREAKING**: `touch`, `mkdir`, `rm`, `mv`, `cp` commands now stage changes instead of committing immediately
- **BREAKING**: `edit` command stages changes after editing instead of committing
- **MODIFIED**: `status` command now displays staged changes in addition to auth status
- **NEW**: `unstage` command to remove staged changes
- **NEW**: `commit` command to commit all staged changes
- **NEW**: `staging.js` module for staging area management

## Capabilities

### New Capabilities
- `file-staging`: Staging area for file operations (create, update, delete) before committing to GitHub

### Modified Capabilities
- `commands`: File operation commands (touch, mkdir, rm, mv, cp, edit) modified to use staging; status enhanced to show staged changes; new unstage and commit commands

## Impact

- `scripts/commands.js` - Modify cmdTouch, cmdMkdir, cmdRm, cmdMv, cmdCp, cmdEdit, cmdStatus
- `scripts/staging.js` - New module for staging area management
- `scripts/github.js` - May need batch commit function
- `openspec/specs/commands/spec.md` - Update with staging behavior
