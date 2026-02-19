## Context

GitHub OS is a browser-based terminal interface for exploring GitHub repositories. Currently it supports read-only operations. Authenticated users (via OAuth with `repo` scope) need write access to manage files directly from the terminal.

### GitHub Contents API Constraints
- Files require base64 encoding for content
- Updating/deleting files requires the file's SHA hash
- Empty directories are not supported (use `.gitkeep` workaround)
- All write operations create commits

## Goals / Non-Goals

**Goals:**
- Implement 5 file operation commands: touch, mkdir, rm, mv, cp
- All operations require authentication
- Proper error handling for 401, 403, 404 responses
- Display commit SHA after successful operations
- `rm` requires explicit user confirmation

**Non-Goals:**
- Multi-file operations (e.g., `rm *.txt`)
- Directory deletion with contents (`rm -r`)
- Batch operations
- File content editing (future: nano/vim-like editor)

## Decisions

### D1: GitHub API Functions Location
**Decision**: Add write functions to `github.js` alongside existing read functions.
**Rationale**: Keeps all GitHub API logic centralized, follows existing patterns.
**Alternatives considered**: Separate `github-write.js` - rejected to avoid circular dependencies.

### D2: Command Confirmation Strategy
**Decision**: `rm` command prompts for confirmation by asking user to type 'yes'.
**Rationale**: Destructive operation, prevents accidental data loss.
**Implementation**: Use terminal's pending callback mechanism for async confirmation.

### D3: Directory Creation Strategy
**Decision**: Create `{dir}/.gitkeep` file for `mkdir` command.
**Rationale**: GitHub doesn't support empty directories; `.gitkeep` is the convention.

### D4: Move/Copy Implementation
**Decision**: `mv` and `cp` are composite operations (read source → create dest → delete source for mv).
**Rationale**: GitHub API doesn't have native move/copy endpoints.
**Trade-off**: Multiple API calls, potential partial failure states.

### D5: Cache Invalidation
**Decision**: Clear relevant cache entries after successful write operations.
**Rationale**: Ensure subsequent reads show updated content.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Partial failure in mv/cp (e.g., dest created but source not deleted) | Display clear error messages indicating operation state |
| Rate limiting on multiple API calls (mv/cp) | Show loading indicator, handle 403 gracefully |
| Concurrent edits cause SHA mismatch | Re-fetch SHA before operation, display conflict error |
| Large file operations timeout | Already limited by GitHub's 1MB file size limit |
