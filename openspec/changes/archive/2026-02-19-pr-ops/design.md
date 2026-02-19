## Context

The GitHub OS CLI currently supports read-only PR operations (viewing PRs). Users need to manage the complete PR lifecycle - creating, merging, and closing pull requests. This change adds authenticated PR operations to the CLI.

**Current State:**
- Users can view repositories and files
- Auth system in place (OAuth PKCE via Cloudflare Worker)
- Write operations exist for files (create/update/delete)
- Branch management implemented

**Stakeholders:** CLI users managing PRs through the terminal interface

**Constraints:**
- Must use GitHub REST API v3
- Requires authentication (OAuth token)
- Must follow existing error handling patterns
- Interactive confirmation required for destructive operations (merge/close)

## Goals / Non-Goals

**Goals:**
- Add PR creation with interactive and direct modes
- Add PR merge with confirmation flow
- Add PR close with confirmation flow
- Integrate seamlessly with existing auth system
- Follow existing code patterns and conventions

**Non-Goals:**
- PR updates (title/body modification) - not in scope
- Draft PR creation - not in scope
- Review operations (approve/request changes) - not in scope
- PR labels/assignees management - not in scope

## Decisions

### 1. PR Creation Modes

**Decision:** Support both interactive and direct modes

- **Interactive:** `pr create` prompts for title and body via terminal.waitForInput()
- **Direct:** `pr create -t "title" -b "body"` creates immediately

**Rationale:** Matches git workflow patterns. Users may want quick PRs or guided creation.

**Alternatives Considered:**
- Only interactive: Slows down automation
- Only direct: Poor UX for new users

### 2. Branch Detection for PR Creation

**Decision:** Auto-detect head/base branches

- **head:** Current checked-out branch (from terminal state)
- **base:** Repository default branch (from getRepoInfo)

**Rationale:** Simplifies user experience. Most PRs are from feature branch to main.

**Alternatives Considered:**
- Manual branch specification: More flexible but more verbose
- Always use 'main': Too restrictive

### 3. Merge Method

**Decision:** Use 'merge' commit method (not squash or rebase)

**Rationale:** Most common method. GitHub API supports 'merge', 'squash', 'rebase'.

**Future Enhancement:** Could add `-m squash` or `-m rebase` flags

### 4. Confirmation Flow Pattern

**Decision:** Use terminal.waitForInput() for destructive operations

**Pattern:**
```javascript
terminal.print('Type "yes" to confirm:');
terminal.waitForInput(async (confirmation) => {
  if (confirmation.toLowerCase() !== 'yes') {
    terminal.print('Operation cancelled');
    return;
  }
  // Proceed with operation
});
```

**Rationale:** Matches existing `rm` command pattern. Provides safety for irreversible operations.

### 5. Error Handling

**Decision:** Map GitHub API errors to user-friendly messages

**Error mappings:**
- 401: "Authentication required"
- 403: "Permission denied"
- 404: "PR not found"
- 422: "Validation failed" (with details from response)

**Rationale:** Consistent with existing github.js error handling pattern

## Risks / Trade-offs

### Risk 1: Merge Conflicts
**Risk:** Merging PRs with conflicts will fail
**Mitigation:** API will return error with message. User must resolve on GitHub.

### Risk 2: Branch Protection Rules
**Risk:** Protected branches may block merge
**Mitigation:** API error will indicate the reason. User must follow branch rules.

### Risk 3: Unauthorized Access
**Risk:** User may try operations without write permission
**Mitigation:** Check isAuthenticated() before attempting. Handle 403 errors gracefully.

### Risk 4: Network Failures
**Risk:** API calls may timeout or fail
**Mitigation:** Try-catch blocks with user-friendly error messages. Show loading state during API calls.

## Migration Plan

**Phase 1: Implementation**
1. Add PR API functions to github.js
2. Extend cmdPr in commands.js
3. Test with authenticated session

**Phase 2: Rollback Strategy**
- If critical bugs found, comment out `pr` command handlers
- Fallback to GitHub web interface
- No data migration needed (read-only operations)

**Deployment:**
- Single commit with all changes
- No configuration changes required
- Existing auth tokens work immediately

## Open Questions

1. **Should we cache PR lists?**
   - Currently not caching
   - Could add caching with TTL for performance
   - **Decision:** Start without caching, add if needed

2. **Multi-repo PR creation?**
   - Not in initial scope
   - Could be future enhancement with `-r owner/repo` flag
   - **Decision:** Defer to future iteration
