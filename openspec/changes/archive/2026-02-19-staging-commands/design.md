## Context

Current write operations (touch, mkdir, rm, mv, cp, edit) immediately commit to GitHub via API. This creates:
- Multiple commits for multi-file operations
- No ability to review changes before committing
- No way to batch related changes

The new staging system stores pending changes locally and commits them together.

## Goals / Non-Goals

**Goals:**
- Stage file changes (create, update, delete) locally
- Display staged changes with `status`
- Commit all staged changes at once
- Unstage individual files or clear all

**Non-Goals:**
- Partial commits (only some staged files)
- Merge conflict resolution
- Offline mode (still need auth for commit)

## Decisions

### 1. Storage: localStorage
**Choice:** Use localStorage with key `github_os_staged_changes`
**Rationale:** Simple, persists across sessions, no backend needed
**Alternative:** IndexedDB (rejected - overkill for small data)

### 2. Staged Change Structure
```javascript
{
  type: 'create' | 'update' | 'delete',
  path: string,           // full path: owner/repo/path/to/file
  content?: string,       // base64 for create/update
  sha?: string,           // for delete/update (original file sha)
  timestamp: number
}
```

### 3. Staging Functions (staging.js)
```javascript
// Core functions
stageCreate(owner, repo, path, content)    // Stage new file
stageUpdate(owner, repo, path, content, sha) // Stage file modification
stageDelete(owner, repo, path, sha)        // Stage file deletion
getStagedChanges()                         // Get all staged changes
unstageFile(path)                          // Remove specific file from staging
clearStaging()                             // Clear all staged changes
commitStaged(token)                        // Commit all staged changes
```

### 4. Command Changes
| Command | Before | After |
|---------|--------|-------|
| touch | createFile() → commit | stageCreate() |
| mkdir | createFile(.gitkeep) → commit | stageCreate(.gitkeep) |
| rm | deleteFile() → commit | stageDelete() |
| mv | create + delete → commit | stageDelete() + stageCreate() |
| cp | createFile() → commit | stageCreate() |
| edit | updateFile() → commit | stageUpdate() |
| status | auth info only | auth + staged changes |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| localStorage quota exceeded | Limit staging to ~100 files, warn user |
| Staged changes lost | Display warning on first use, consider persistence backup |
| Conflicts with remote | Check file state before commit, warn if changed |
| User forgets staged changes | Show count in prompt or status |
