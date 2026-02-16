# Design: Releases Command

## Overview

This document describes the technical design for the `releases` command, which allows users to view GitHub releases from within the terminal.

## API Endpoint

GitHub REST API endpoint for listing repository releases:

```
GET /repos/{owner}/{repo}/releases
```

Query parameters:
- `per_page`: Number of results (default: 30, max: 100)

Reference: https://docs.github.com/en/rest/releases/releases#list-releases

## Implementation Details

### 1. fetchRepoReleases() in scripts/github.js

```javascript
export async function fetchRepoReleases(owner, repo, count = 10)
```

Parameters:
- `owner`: Repository owner (string)
- `repo`: Repository name (string)
- `count`: Number of releases to fetch (default: 10)

Returns: Array of formatted release objects:
```javascript
{
  tag_name: "v1.0.0",
  name: "Version 1.0.0",
  author: "username",
  published_at: "2026-02-16T10:00:00Z",
  prerelease: false,
  html_url: "https://github.com/..."
}
```

Cache key: `releases:{owner}/{repo}:{count}`

Error handling:
- Rate limit checking via `checkRateLimit()`
- Empty repository returns empty array
- Network errors throw with descriptive message

### 2. cmdReleases() in scripts/commands.js

```javascript
async function cmdReleases(terminal, githubUser, args)
```

Logic:
1. Parse arguments for count (optional numeric parameter)
2. Validate user is in a repository (not root)
3. Call `fetchRepoReleases()` with parsed path and count
4. Format and display releases with:
   - Tag name in green/success color
   - Release name (escaped HTML)
   - Author in info color
   - Relative date using `formatRelativeDate()`
   - Pre-release indicator if applicable
5. Handle empty releases gracefully

### 3. Command Registration

Add to commands registry:
```javascript
import { ..., fetchRepoReleases } from './github.js';

export const commands = {
  ...,
  releases: cmdReleases
};
```

Update tab completion in `getCompletions()`:
```javascript
const commands = ['help', ..., 'issues', 'releases'];
```

Update help text in `cmdHelp()`.

## Display Format

```
v1.2.0  Version 1.2.0 - Bug fixes      @johndoe (2 days ago)
v1.1.0  Version 1.1.0 - New features   @janedoe (1 week ago) [pre-release]
v1.0.0  Initial Release                @devuser (3 weeks ago)

3 release(s)
```

Color coding:
- Tag name: green/success
- Release name: default
- Author: info color
- Relative date: info color
- Pre-release: warning color with brackets

## Edge Cases

1. **Empty repository (no releases)**: Display "No releases found" message
2. **Not in repository**: Display error "Not in a repository. Use 'cd' to enter a repo first."
3. **Rate limit exceeded**: Leverage existing `checkRateLimit()` function
4. **Invalid count**: Display usage error for non-numeric count

## Security Considerations

- HTML escaping via `escapeHtml()` for release names
- No user input goes to API endpoints (path derived from state)
- Standard rate limit handling

## Testing Strategy

1. **Unit tests** (tests/unit/github.test.js):
   - fetchRepoReleases returns formatted releases
   - Handles count parameter correctly
   - Caches results
   - Returns empty array for no releases

2. **Integration tests** (tests/integration/commands.test.js):
   - Command registered in registry
   - Help text includes releases command
   - Error handling for root directory

## Files Modified

1. `scripts/github.js` - Add `fetchRepoReleases()`
2. `scripts/commands.js` - Add `cmdReleases()`, update registry and help
3. `tests/unit/github.test.js` - Add unit tests
4. `tests/integration/commands.test.js` - Add integration tests
5. `README.md` - Document new command
