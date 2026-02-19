## Why

GitHub OS currently provides read-only file operations (cat, head, tail, grep, download). Authenticated users need the ability to create, modify, and delete files directly from the terminal interface, providing a complete command-line experience for repository management.

## What Changes

- **New commands**: `touch`, `mkdir`, `rm`, `mv`, `cp` for file operations
- **GitHub API write operations**: Create, update, and delete files via Contents API
- **Authentication requirement**: All write operations require valid OAuth session
- **Confirmation prompts**: `rm` command requires explicit confirmation before deletion
- **Commit tracking**: All operations display resulting commit SHA for verification

## Capabilities

### New Capabilities
- `file-operations`: Write operations for authenticated users including touch, mkdir, rm, mv, cp commands

### Modified Capabilities
- `commands`: Add new file operation commands to the command registry
- `github-api`: Add write operations (createFile, deleteFile, getFile, updateFile)

## Impact

- **scripts/github.js**: Add createFile, deleteFile, getFile, updateFile functions
- **scripts/commands.js**: Add cmdTouch, cmdMkdir, cmdRm, cmdMv, cmdCp functions
- **Authentication required**: All file operations check isAuthenticated() before execution
- **Cache invalidation**: Clear cache after write operations to reflect changes
