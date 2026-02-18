## Context

The current file operations (touch, mkdir, rm, mv, cp) use GitHub Contents API which creates individual commits per operation. Users cannot group related changes into a single logical commit.

GitHub offers two APIs for file operations:
1. **Contents API** - Simple but one commit per file
2. **Git Data API** - Complex but supports batch commits via tree manipulation

We need to implement Git Data API integration for batch commits while maintaining the existing single-file operations.

## Goals / Non-Goals

**Goals:**
- Implement batch commit with multiple file changes in single commit
- Create staging area for tracking pending changes
- Add `add`, `diff`, `commit -m` commands following git workflow
- Use Git Data API: create tree → create commit → update ref

**Non-Goals:**
- Not replacing existing single-file operations (touch, rm, etc.)
- Not implementing push/pull (GitHub always reflects changes immediately)
- Not supporting merge operations

## Decisions

### 1. Staging Module Architecture
**Decision:** Separate `staging.js` module with localStorage persistence

```javascript
// staging.js exports
export function getStagedChanges();      // Returns { creates, updates, deletes }
export function stageCreate(path, content);
export function stageUpdate(path, content, sha);
export function stageDelete(path, sha);
export function unstage(path);
export function clearStaging();
export function hasStagedChanges();
```

**Rationale:** 
- LocalStorage persists across page refresh
- Decoupled from commands.js for testability
- Follows git staging metaphor

### 2. Git Data API Flow
**Decision:** Use full Git Data API flow for batch commits

```
1. Get current commit SHA (HEAD of branch)
2. Get current tree SHA from that commit
3. Create new tree with all changes (POST /git/trees)
4. Create new commit pointing to new tree (POST /git/commits)
5. Update branch ref to new commit (PATCH /git/refs/heads/{branch})
```

**API Calls:**
```javascript
GET  /repos/{owner}/{repo}/git/refs/heads/{branch}  → baseCommitSha
GET  /repos/{owner}/{repo}/git/commits/{sha}        → baseTreeSha
POST /repos/{owner}/{repo}/git/trees                → newTreeSha
POST /repos/{owner}/{repo}/git/commits              → newCommitSha
PATCH /repos/{owner}/{repo}/git/refs/heads/{branch} → done
```

**Rationale:** This is the standard Git Data API pattern for creating commits with multiple changes.

### 3. Command Integration
**Decision:** Add new commands rather than modifying existing file operations

```bash
# New workflow
touch file1.txt file2.txt file3.txt  # Creates files (individual commits)
# OR
edit file1.txt                       # Edit but stage for batch

add file1.txt file2.txt              # Stage changes
diff                                 # View staged changes
commit -m "Add multiple files"       # Batch commit
```

**Rationale:** 
- Existing commands remain unchanged for backward compatibility
- New `add` command provides explicit staging control
- Mirrors git workflow users already know

### 4. Tree Entry Format
**Decision:** Use base64 encoded content for tree entries

```javascript
const treeEntries = [
  // Create file
  { path: 'new.txt', mode: '100644', type: 'blob', content: 'file content' },
  // Update file (base tree provides original, new entry overrides)
  { path: 'existing.txt', mode: '100644', type: 'blob', content: 'new content' },
  // Delete file
  { path: 'old.txt', mode: '100644', type: 'blob', sha: null }
];
```

**Rationale:** GitHub API accepts either `content` (base64) or `sha` for blobs. Using `content` for creates/updates and `sha: null` for deletes.

## Risks / Trade-offs

**[Risk] API Rate Limits**
- Git Data API makes 4-5 calls per batch commit vs 1 call per Contents API
- **Mitigation:** Batch commits are user-initiated, not automated; rate limits unlikely to be hit

**[Risk] Concurrent Modifications**
- Another user might push changes between getting base tree and updating ref
- **Mitigation:** GitHub will reject the ref update; display error and suggest retry

**[Risk] Large Files**
- Tree entries with inline content limited to ~1MB
- **Mitigation:** Document limitation; recommend single commits for large files

**[Trade-off] Complexity vs Convenience**
- Git Data API is more complex than Contents API
- But provides essential batch commit capability

## Migration Plan

1. **Phase 1:** Add staging.js module (no breaking changes)
2. **Phase 2:** Add batchCommit to github.js
3. **Phase 3:** Add add, diff, commit commands
4. **Phase 4:** Update help text

No rollback needed - existing functionality unchanged.
