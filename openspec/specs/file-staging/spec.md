# File Staging Spec

## Overview

Stage file changes before batch commit.

## Requirements

### 1. Staging Area Structure
```javascript
{
  creates: { "path": content },
  updates: { "path": { content, sha } },
  deletes: { "path": sha }
}
```

### 2. Stage Operations
- `stageCreate(path, content)` - Stage new file
- `stageUpdate(path, content, sha)` - Stage file modification
- `stageDelete(path, sha)` - Stage file deletion

### 3. Query Operations
- `getStagedChanges()` - Get all staged changes
- `hasStagedChanges()` - Check if any staged
- `isStaged(path)` - Check if specific file staged

### 4. Management
- `unstage(path)` - Remove from staging
- `clearStaging()` - Clear all staged changes

### 5. Persistence
- Store in localStorage
- Key: github_os_staging

## Files

- `scripts/staging.js` - Staging implementation

## Status

✅ Implemented in v2.2.0
