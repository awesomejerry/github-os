# Implementation Tasks

## Phase 1: Core Implementation

### 1.1 Add fetchRepoIssues() to scripts/github.js
- [ ] Create function signature: `fetchRepoIssues(owner, repo, state = 'open')`
- [ ] Add cache key: `issues:{owner}/{repo}:{state}`
- [ ] Fetch from API: `GET /repos/{owner}/{repo}/issues?state={state}&per_page=30`
- [ ] Check rate limit with `checkRateLimit(response)`
- [ ] Filter out pull requests (check for `pull_request` field)
- [ ] Format response to extract: number, title, author, labels, created_at, state, html_url
- [ ] Cache and return formatted issues
- [ ] Export function

### 1.2 Add cmdIssues() to scripts/commands.js
- [ ] Create async function `cmdIssues(terminal, githubUser, args)`
- [ ] Parse args for `--closed` and `--all` flags
- [ ] Determine state: 'open' (default), 'closed', or 'all'
- [ ] Check if in repository (not root path)
- [ ] Call `fetchRepoIssues()` with parsed owner/repo/state
- [ ] Handle empty issues with friendly message
- [ ] Format each issue with:
  - Issue number (green/success)
  - Title (HTML escaped)
  - Author (info color)
  - Labels (bracketed, info color)
  - Relative date via `formatRelativeDate()`
- [ ] Display issue count at end
- [ ] Handle errors gracefully

### 1.3 Register command and update UI
- [ ] Import `fetchRepoIssues` in commands.js
- [ ] Add `issues: cmdIssues` to commands registry
- [ ] Add 'issues' to command list in `getCompletions()`
- [ ] Add `issues` entry to `cmdHelp()` output

## Phase 2: Testing

### 2.1 Unit tests in tests/unit/github.test.js
- [ ] Test: fetchRepoIssues returns formatted issues
- [ ] Test: fetchRepoIssues filters by state correctly
- [ ] Test: fetchRepoIssues filters out pull requests
- [ ] Test: fetchRepoIssues caches results
- [ ] Test: fetchRepoIssues handles empty repository

### 2.2 Integration tests in tests/integration/commands.test.js
- [ ] Test: 'issues' command is in registry
- [ ] Test: 'issues' appears in help text

## Phase 3: Documentation

### 3.1 Update README.md
- [ ] Add `issues` command to Commands table
- [ ] Include usage examples with flags

## Phase 4: Verification

### 4.1 Run tests
- [ ] Run `npm test` - all tests pass
- [ ] Manual testing in browser

---

## File Changes Summary

| File | Action |
|------|--------|
| `scripts/github.js` | Add `fetchRepoIssues()` |
| `scripts/commands.js` | Add `cmdIssues()`, update registry, update help |
| `tests/unit/github.test.js` | Add unit tests for `fetchRepoIssues` |
| `tests/integration/commands.test.js` | Add integration tests for issues command |
| `README.md` | Document issues command |

## Dependencies

- Existing: `checkRateLimit()`, `formatRelativeDate()`, `escapeHtml()`, `parsePath()`
- No new external dependencies required
