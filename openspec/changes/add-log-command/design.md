## Context

GitHub OS is a web-based terminal interface for browsing GitHub repositories. It uses vanilla JavaScript with ES6 modules, calling the GitHub REST API directly from the browser. The existing command pattern follows a registry approach in `commands.js`, with API functions in `github.js`.

## Goals / Non-Goals

**Goals:**
- Add `log` command to display recent commits for the current repository
- Support optional count parameter with default of 10
- Display commit hash (short), author, relative date, and message
- Follow existing command patterns and styling conventions

**Non-Goals:**
- Authentication for private repositories
- Commit diff viewing
- Branch selection (will use default branch)
- Pagination beyond requested count

## Decisions

### API Endpoint
Use `GET /repos/{owner}/{repo}/commits` endpoint with `per_page` parameter. This provides all needed data in a single request.

**Alternative considered:** GraphQL API would require authentication, so REST API is preferred for unauthenticated access.

### Date Formatting
Use `Intl.RelativeTimeFormat` for human-readable relative dates (e.g., "2 days ago"). Fallback to absolute date for older commits.

### Hash Display
Show first 7 characters of commit SHA, matching Git's default short hash format.

## Risks / Trade-offs

- **API Rate Limiting**: Unauthenticated requests limited to 60/hour per IP → Add caching for commit data
- **Large Commit Messages**: Long messages may wrap awkwardly → Truncate to 72 characters with ellipsis
- **Empty Repositories**: New repos may have no commits → Display "No commits yet" message
