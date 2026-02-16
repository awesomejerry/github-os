# Proposal: Add Issues Command

## Why

Users browsing repositories in GitHub OS cannot view the issues associated with a repository. This is a common task when exploring open-source projects - developers often want to see what bugs are being tracked, what features are planned, and how active the project's issue management is.

Currently, to view issues, users must leave the GitHub OS terminal and navigate to github.com in a separate browser tab. This breaks the terminal experience and requires context switching.

## What Changes

Add an `issues` command that displays repository issues directly in the terminal, following the same pattern as existing commands like `log`, `branch`, and `find`.

### Command Options

- `issues` - List open issues (default)
- `issues --closed` - List closed issues
- `issues --all` - List all issues (open and closed)

### Display Format

Each issue will show:
- Issue number (e.g., #123)
- Title
- Author
- Labels (if any)
- Created date (relative format)

## Capabilities

### Added Capabilities

- `issues-command`: New command to list repository issues with filtering options

## Impact

- New `fetchRepoIssues()` function in `github.js`
- New `cmdIssues()` function in `commands.js`
- Updated help text and tab completion
- Unit and integration tests
- README documentation
