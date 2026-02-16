# Implementation Tasks

## Phase 1: Core Implementation

### 1.1 Add fetchRepoContributors() to scripts/github.js
- [ ] Create function signature: `fetchRepoContributors(owner, repo, count = 20)`
- [ ] Add cache key: `contributors:{owner}/{repo}:{count}`
- [ ] Fetch from API: `GET /repos/{owner}/{repo}/contributors?per_page={count}`
- [ ] Check rate limit with `checkRateLimit(response)`
- [ ] Handle 204 response (stats not ready)
- [ ] Format response to extract: login, avatar_url, contributions, html_url
- [ ] Cache and return formatted contributors
- [ ] Export function

### 1.2 Add cmdContributors() to scripts/commands.js
- [ ] Create async function `cmdContributors(terminal, githubUser, args)`
- [ ] Parse count argument (default: 20)
- [ ] Validate count is a positive number
- [ ] Check if in repository (not root path)
- [ ] Call `fetchRepoContributors()` with parsed owner/repo/count
- [ ] Handle empty contributors with friendly message
- [ ] Format each contributor with:
  - Avatar emoji
  - Username (info color)
  - Contribution count (success color)
- [ ] Display contributor count at end
- [ ] Handle errors gracefully

### 1.3 Register command and update UI
- [ ] Import `fetchRepoContributors` in commands.js
- [ ] Add `contributors: cmdContributors` to commands registry
- [ ] Add 'contributors' to command list in `getCompletions()`
- [ ] Add `contributors` entry to `cmdHelp()` output

## Phase 2: Testing

### 2.1 Unit tests in tests/unit/github.test.js
- [ ] Test: fetchRepoContributors returns formatted contributors
- [ ] Test: fetchRepoContributors respects count parameter
- [ ] Test: fetchRepoContributors caches results
- [ ] Test: fetchRepoContributors handles empty repository
- [ ] Test: fetchRepoContributors handles 204 response

### 2.2 Integration tests in tests/integration/commands.test.js
- [ ] Test: 'contributors' command is in registry
- [ ] Test: 'contributors' appears in help text

## Phase 3: Documentation

### 3.1 Update README.md
- [ ] Add `contributors` command to Commands table
- [ ] Include usage examples

## Phase 4: Verification

### 4.1 Run tests
- [ ] Run `npm test` - all tests pass
- [ ] Manual testing in browser

---

## File Changes Summary

| File | Action |
|------|--------|
| `scripts/github.js` | Add `fetchRepoContributors()` |
| `scripts/commands.js` | Add `cmdContributors()`, update registry, update help |
| `tests/unit/github.test.js` | Add unit tests for `fetchRepoContributors` |
| `tests/integration/commands.test.js` | Add integration tests for contributors command |
| `README.md` | Document contributors command |

## Dependencies

- Existing: `checkRateLimit()`, `escapeHtml()`, `parsePath()`
- No new external dependencies required
