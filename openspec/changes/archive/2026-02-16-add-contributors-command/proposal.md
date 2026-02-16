# Proposal: Add Contributors Command

## Why

Users browsing repositories in GitHub OS cannot view the contributors who have helped build a project. This is valuable information when exploring open-source projects - developers often want to see who has contributed, how active the community is, and recognize the people behind the code.

Currently, to view contributors, users must leave the GitHub OS terminal and navigate to github.com in a separate browser tab. This breaks the terminal experience and requires context switching.

## What Changes

Add a `contributors` command that displays repository contributors directly in the terminal, following the same pattern as existing commands like `log`, `branch`, `issues`, and `find`.

### Command Options

- `contributors` - List top 20 contributors (default)
- `contributors [count]` - List N contributors (e.g., `contributors 50`)

### Display Format

Each contributor will show:
- Username (with optional avatar emoji)
- Contribution count
- Sorted by contribution count (highest first)

## Capabilities

### Added Capabilities

- `contributors-command`: New command to list repository contributors with customizable count

## Impact

- New `fetchRepoContributors()` function in `github.js`
- New `cmdContributors()` function in `commands.js`
- Updated help text and tab completion
- Unit and integration tests
- README documentation
