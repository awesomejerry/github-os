# Design: Issues Command

## Overview

This document describes the technical design for the `issues` command, which allows users to view GitHub issues from within the terminal.

## API Endpoint

GitHub REST API endpoint for listing repository issues:

```
GET /repos/{owner}/{repo}/issues
```

Query parameters:
- `state`: `open` (default), `closed`, or `all`
- `per_page`: Number of results (default: 30, max: 100)

Reference: https://docs.github.com/en/rest/issues/issues#list-repository-issues

## Implementation Details

### 1. fetchRepoIssues() in scripts/github.js

```javascript
export async function fetchRepoIssues(owner, repo, state = 'open')
```

Parameters:
- `owner`: Repository owner (string)
- `repo`: Repository name (string)
- `state`: Issue state filter ('open', 'closed', 'all')

Returns: Array of formatted issue objects:
```javascript
{
  number: 123,
  title: "Issue title",
  author: "username",
  labels: ["bug", "enhancement"],
  created_at: "2026-02-16T10:00:00Z",
  state: "open",
  html_url: "https://github.com/..."
}
```

Cache key: `issues:{owner}/{repo}:{state}`

Error handling:
- Rate limit checking via `checkRateLimit()`
- Empty repository returns empty array
- Network errors throw with descriptive message

### 2. cmdIssues() in scripts/commands.js

```javascript
async function cmdIssues(terminal, githubUser, args)
```

Logic:
1. Parse arguments for `--closed` and `--all` flags
2. Determine state: 'open', 'closed', or 'all'
3. Validate user is in a repository (not root)
4. Call `fetchRepoIssues()` with parsed path and state
5. Format and display issues with:
   - Issue number in green/success color
   - Title (escaped HTML)
   - Author in info color
   - Labels as colored badges
   - Relative date using `formatRelativeDate()`
6. Handle empty issues gracefully

### 3. Command Registration

Add to commands registry:
```javascript
import { ..., fetchRepoIssues } from './github.js';

export const commands = {
  ...,
  issues: cmdIssues
};
```

Update tab completion in `getCompletions()`:
```javascript
const commands = ['help', ..., 'find', 'issues'];
```

Update help text in `cmdHelp()`.

## Display Format

```
#123 Bug in login flow                  @johndoe [bug] (2 days ago)
#125 Feature request: dark mode         @janedoe [enhancement] (1 week ago)
#130 Fix memory leak in parser          @devuser [bug, performance] (3 weeks ago)

3 issue(s)
```

Labels displayed inline, separated by commas. Color coding:
- Issue numbers: green/success
- Author: info color
- Labels: info color with brackets
- Relative date: info color

## Edge Cases

1. **Empty repository (no issues)**: Display "No issues found" message
2. **Not in repository**: Display error "Not in a repository. Use 'cd' to enter a repo first."
3. **Rate limit exceeded**: Leverage existing `checkRateLimit()` function
4. **Pull requests in response**: GitHub API returns PRs in issues endpoint; filter by checking for `pull_request` field

## Security Considerations

- HTML escaping via `escapeHtml()` for issue titles
- No user input goes to API endpoints (path derived from state)
- Standard rate limit handling

## Testing Strategy

1. **Unit tests** (tests/unit/github.test.js):
   - fetchRepoIssues returns formatted issues
   - Handles state filters correctly
   - Filters out pull requests
   - Caches results

2. **Integration tests** (tests/integration/commands.test.js):
   - Command registered in registry
   - Help text includes issues command
   - Error handling for root directory

## Files Modified

1. `scripts/github.js` - Add `fetchRepoIssues()`
2. `scripts/commands.js` - Add `cmdIssues()`, update registry and help
3. `tests/unit/github.test.js` - Add unit tests
4. `tests/integration/commands.test.js` - Add integration tests
5. `README.md` - Document new command
