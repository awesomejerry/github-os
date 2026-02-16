# Design: Contributors Command

## Overview

This document describes the technical design for the `contributors` command, which allows users to view GitHub repository contributors from within the terminal.

## API Endpoint

GitHub REST API endpoint for listing repository contributors:

```
GET /repos/{owner}/{repo}/contributors
```

Query parameters:
- `per_page`: Number of results (default: 20, max: 100)
- `anon`: Include anonymous contributors (default: false)

Reference: https://docs.github.com/en/rest/metrics/statistics#get-all-contributor-commit-activity

Note: This endpoint may return cached data and can take a moment to generate for large repos.

## Implementation Details

### 1. fetchRepoContributors() in scripts/github.js

```javascript
export async function fetchRepoContributors(owner, repo, count = 20)
```

Parameters:
- `owner`: Repository owner (string)
- `repo`: Repository name (string)
- `count`: Number of contributors to return (default: 20)

Returns: Array of formatted contributor objects:
```javascript
{
  login: "username",
  avatar_url: "https://avatars.githubusercontent.com/u/...",
  contributions: 42,
  html_url: "https://github.com/username"
}
```

Cache key: `contributors:{owner}/{repo}:{count}`

Error handling:
- Rate limit checking via `checkRateLimit()`
- Empty repository returns empty array
- 204 No Content (stats not ready) returns empty array with message
- Network errors throw with descriptive message

### 2. cmdContributors() in scripts/commands.js

```javascript
async function cmdContributors(terminal, githubUser, args)
```

Logic:
1. Parse count argument (default: 20)
2. Validate count is a positive number
3. Validate user is in a repository (not root)
4. Call `fetchRepoContributors()` with parsed path and count
5. Format and display contributors with:
   - Username with avatar emoji (optional)
   - Contribution count
   - Sorted by contribution count (already sorted by API)
6. Handle empty contributors gracefully

### 3. Command Registration

Add to commands registry:
```javascript
import { ..., fetchRepoContributors } from './github.js';

export const commands = {
  ...,
  contributors: cmdContributors
};
```

Update tab completion in `getCompletions()`:
```javascript
const commands = ['help', ..., 'issues', 'contributors'];
```

Update help text in `cmdHelp()`.

## Display Format

```
 @alice        123 contributions
 @bob          87 contributions
 @charlie      45 contributions
 @david        12 contributions

4 contributor(s)
```

Color coding:
- Username: info color
- Contribution count: success color
- Count summary: info color

Avatar emoji: The avatar emoji (👤) provides visual distinction for each contributor line.

## Edge Cases

1. **Empty repository (no contributors)**: Display "No contributors found" message
2. **Not in repository**: Display error "Not in a repository. Use 'cd' to enter a repo first."
3. **Rate limit exceeded**: Leverage existing `checkRateLimit()` function
4. **Stats not ready (204)**: GitHub returns 204 when stats are being computed; display friendly message
5. **Invalid count argument**: Display usage error

## Security Considerations

- HTML escaping via `escapeHtml()` for usernames
- No user input goes to API endpoints directly
- Standard rate limit handling
- Validate count is a positive integer

## Testing Strategy

1. **Unit tests** (tests/unit/github.test.js):
   - fetchRepoContributors returns formatted contributors
   - Handles count parameter correctly
   - Caches results
   - Handles 204 response (stats not ready)

2. **Integration tests** (tests/integration/commands.test.js):
   - Command registered in registry
   - Help text includes contributors command

## Files Modified

1. `scripts/github.js` - Add `fetchRepoContributors()`
2. `scripts/commands.js` - Add `cmdContributors()`, update registry and help
3. `tests/unit/github.test.js` - Add unit tests
4. `tests/integration/commands.test.js` - Add integration tests
5. `README.md` - Document new command
