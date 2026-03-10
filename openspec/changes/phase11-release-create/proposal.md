## Why

Users can list and view releases, but cannot publish releases from the terminal yet. Creating releases in-flow is the next high-value step for release management.

## What Changes

- Add `release create <tag>` command for creating GitHub releases.
- Support flags for basic non-interactive creation:
  - `-t "<title>"`
  - `-b "<notes>"`
  - `--draft`
  - `--prerelease`
- Add GitHub API helper for release creation.

## Capabilities

### New Capabilities
- `release-create-command`: create a release from terminal command.

### Modified Capabilities
- `releases-command`: extend `release` command with `create` subcommand.
- `github-api`: support release creation endpoint.

## Impact

- `scripts/commands.js` (new `release create` handler)
- `scripts/github.js` (new API function for create release)
- tests + docs updates
