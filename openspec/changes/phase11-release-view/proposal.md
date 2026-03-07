## Why

`release` currently only lists releases (alias to `releases`). Users cannot inspect a specific release in detail from the terminal, which forces context switching to GitHub web UI.

## What Changes

- Add `release view <tag>` subcommand to show detailed release information.
- Add GitHub API helper to fetch a release by tag.
- Keep existing `release [count]` alias behavior unchanged.

## Capabilities

### New Capabilities
- `release-view-command`: view a release by tag with key metadata and body.

### Modified Capabilities
- `releases-command`: extend singular `release` command to support `view <tag>` subcommand.
- `github-api`: add endpoint integration for release-by-tag retrieval.

## Impact

- `scripts/commands.js` (new `release view` handler)
- `scripts/github.js` (new fetch release-by-tag helper)
- tests for API + command behavior
- docs command reference and user guide
