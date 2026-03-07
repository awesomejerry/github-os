## Overview

Implement `release view <tag>` as a subcommand under singular `release` command while preserving alias listing behavior.

## Command Design

- `release` → list releases (existing behavior)
- `release <count>` → list releases with count (existing behavior)
- `release view <tag>` → show detailed single release

## API Design

Add `fetchReleaseByTag(owner, repo, tag)` in `scripts/github.js` using:
- `GET /repos/{owner}/{repo}/releases/tags/{tag}`

Return normalized shape:
- tag_name, name, author, published_at, prerelease, draft, html_url, body

## Output Design

`release view <tag>` prints:
- header with tag + name
- author / published relative date / flags (draft, pre-release)
- body (or "No release notes")
- release URL

## Error Handling

- not in repo: existing command error path
- missing tag argument: usage error
- release not found (404): clear error message
