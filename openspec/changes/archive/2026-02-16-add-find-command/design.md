# Design: Find Command Implementation

## Approach
Use GitHub's Git Trees API (`GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1`) to fetch all files in the repository recursively.

## API Selection
- **Git Trees API**: Free, no authentication required, returns full file tree in one request
- **Alternative (Code Search API)**: Requires authentication, not suitable for file name search

## Components

### 1. github.js - `fetchRepoTree(owner, repo)`
```javascript
// Fetch recursive tree from GitHub API
// Endpoint: /repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1
// Returns: Array of { path, type }
```

### 2. commands.js - `cmdFind(terminal, githubUser, args)`
- Validate repository context
- Fetch full tree
- Filter by glob-style pattern (convert `*.js` to regex)
- Display matching paths

## Pattern Matching
Support basic glob patterns:
- `*.js` → matches all .js files
- `test` → matches any file with "test" in the path
- `src/utils` → matches paths containing "src/utils"

Convert glob to regex: `*` → `.*`, `?` → `.`

## Error Handling
- Not in repository → "Not in a repository"
- No matches → "No files found matching pattern"
- API failure → Generic error message
