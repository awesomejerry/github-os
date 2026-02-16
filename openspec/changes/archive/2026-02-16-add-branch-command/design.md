## Context

GitHub OS is a web-based terminal interface for browsing GitHub repositories. It uses vanilla JavaScript with ES6 modules, calling the GitHub REST API directly from the browser. The existing command pattern follows a registry approach in `commands.js`, with API functions in `github.js`.

## Goals / Non-Goals

**Goals:**
- Add `branch` command to display all branches for the current repository
- Mark the default branch with an asterisk (*)
- Error if not in a repository context (at root /)
- Follow existing command patterns and styling conventions

**Non-Goals:**
- Switching branches (GitHub OS views the default branch only)
- Creating or deleting branches
- Branch comparison or diff viewing

## Decisions

### API Endpoint
Use `GET /repos/{owner}/{repo}/branches` endpoint to fetch all branches. Use `GET /repos/{owner}/{repo}` endpoint to get the default branch name.

### Default Branch Indicator
Fetch default branch from repository info (already available via `getRepoInfo`) and mark it with `*` prefix, matching common git UI conventions.

### Output Format
Display branch names in a simple list format, with the default branch marked. Use directory-style coloring for branch names.

## Risks / Trade-offs

- **API Rate Limiting**: Unauthenticated requests limited to 60/hour per IP → Add caching for branch data
- **Many Branches**: Large repos may have hundreds of branches → Display all, could add pagination later
- **Protected Branches**: Some branch metadata requires authentication → Only show basic branch name and default indicator
