## Context

The GitHub OS terminal currently supports only listing branches via the `branch` command. Users need the ability to create new branches, delete branches, and switch between branches to fully manage repositories from the terminal.

**Current State:**
- `branch` command lists all branches with default branch marked with `*`
- `fetchRepoBranches()` fetches branch list from GitHub API
- Authentication is handled via OAuth (see shared-decisions.md)

**Constraints:**
- Branch creation requires authentication with `repo` scope
- Branch deletion requires authentication with `repo` scope
- Cannot delete the currently active/default branch
- New branches are created from the default branch's HEAD

## Goals / Non-Goals

**Goals:**
- Add `branch -c <name>` to create a new branch from default branch HEAD
- Add `branch -d <name>` to delete a branch
- Add `checkout <branch>` to switch the current branch context
- Clear relevant cache after branch operations

**Non-Goals:**
- Creating branches from arbitrary commit SHAs
- Force deletion of unmerged branches
- Branch renaming (`branch -m`)
- Remote branch operations

## Decisions

### D1: Branch Creation Strategy
**Decision:** Create new branches from the default branch's HEAD SHA.

**Rationale:** This matches the common workflow of creating feature branches from main/master. To get the SHA, we call `GET /repos/{owner}/{repo}/git/ref/heads/{default_branch}`.

**Alternative Considered:** Allow specifying a source branch. Rejected to keep initial implementation simple.

### D2: Checkout Implementation
**Decision:** `checkout <branch>` stores the current branch in session state and clears the file tree cache.

**Rationale:** The terminal doesn't actually "switch" branches in a git sense. Instead, it stores which branch context the user is viewing and invalidates cached data so subsequent commands use the new branch context.

**State Storage:** Use a simple module-level variable in `app.js` or extend the session to track `currentBranch`.

### D3: Authentication Requirement
**Decision:** Require authentication for `branch -c` and `branch -d`. Show clear error if not authenticated.

**Rationale:** GitHub API requires `repo` scope for write operations. The existing `isAuthenticated()` check from session.js is used.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| User tries to delete protected branch | GitHub API returns 403, display clear error message |
| User tries to delete default branch | Pre-check branch name against default branch before API call |
| Branch already exists | GitHub API returns 422, display "Branch already exists" |
| Cache stale after operations | Clear `branches`, `tree`, and `contents` cache after create/delete/checkout |
