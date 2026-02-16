## Why

Users browsing GitHub repositories in the terminal need to view release information to understand project versioning, track updates, and download specific versions. Currently, there is no way to see release history without leaving the terminal to visit GitHub's web interface.

## What Changes

- Add new `releases` command to display repository releases for the current repository
- Accept optional count parameter (e.g., `releases 20`) with default of 10 releases
- Display tag name, release name, author, published date, and pre-release flag
- Use GitHub REST API to fetch release data

## Capabilities

### New Capabilities

- `releases-command`: Display release history for the current repository

### Modified Capabilities

- `commands`: Add `releases` command to the commands specification
- `github-api`: Add release fetching capability to support the releases command

## Impact

- New `releases` command handler in command system
- New API function to fetch repository releases from GitHub
- Updates to help text to document the new command
