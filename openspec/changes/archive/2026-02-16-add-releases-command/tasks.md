# Implementation Tasks

## Phase 1: Core Implementation

### 1.1 Add fetchRepoReleases() to scripts/github.js
- [ ] Create function signature: `fetchRepoReleases(owner, repo, count = 10)`
- [ ] Add cache key: `releases:{owner}/{repo}:{count}`
- [ ] Fetch from API: `GET /repos/{owner}/{repo}/releases?per_page={count}`
- [ ] Check rate limit with `checkRateLimit(response)`
- [ ] Format response to extract: tag_name, name, author, published_at, prerelease, html_url
- [ ] Cache and return formatted releases
- [ ] Export function

### 1.2 Add cmdReleases() to scripts/commands.js
- [ ] Create async function `cmdReleases(terminal, githubUser, args)`
- [ ] Parse args for count (numeric parameter)
- [ ] Check if in repository (not root path)
- [ ] Call `fetchRepoReleases()` with parsed owner/repo/count
- [ ] Handle empty releases with friendly message
- [ ] Format each release with:
  - Tag name (green/success)
  - Release name (HTML escaped)
  - Author (info color)
  - Relative date via `formatRelativeDate()`
  - Pre-release indicator (warning color)
- [ ] Display release count at end
- [ ] Handle errors gracefully

### 1.3 Register command and update UI
- [ ] Import `fetchRepoReleases` in commands.js
- [ ] Add `releases: cmdReleases` to commands registry
- [ ] Add 'releases' to command list in `getCompletions()`
- [ ] Add `releases` entry to `cmdHelp()` output

## Phase 2: Testing

### 2.1 Unit tests in tests/unit/github.test.js
- [ ] Test: fetchRepoReleases returns formatted releases
- [ ] Test: fetchRepoReleases respects count parameter
- [ ] Test: fetchRepoReleases caches results
- [ ] Test: fetchRepoReleases handles empty repository

### 2.2 Integration tests in tests/integration/commands.test.js
- [ ] Test: 'releases' command is in registry
- [ ] Test: 'releases' appears in help text

## Phase 3: Documentation

### 3.1 Update README.md
- [ ] Add `releases` command to Commands table
- [ ] Include usage examples

## Phase 4: Verification

### 4.1 Run tests
- [ ] Run `npm test` - all tests pass
- [ ] Manual testing in browser

---

## File Changes Summary

| File | Action |
|------|--------|
| `scripts/github.js` | Add `fetchRepoReleases()` |
| `scripts/commands.js` | Add `cmdReleases()`, update registry, update help |
| `tests/unit/github.test.js` | Add unit tests for `fetchRepoReleases` |
| `tests/integration/commands.test.js` | Add integration tests for releases command |
| `README.md` | Document releases command |

## Dependencies

- Existing: `checkRateLimit()`, `formatRelativeDate()`, `escapeHtml()`, `parsePath()`
- No new external dependencies required
