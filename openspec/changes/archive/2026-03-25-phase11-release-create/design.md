## Overview

Implement `release create <tag>` under existing `release` command family.

## CLI Contract

- `release create <tag> -t "Title" -b "Notes"`
- Optional:
  - `--draft`
  - `--prerelease`

Initial implementation is non-interactive and requires `<tag>`.

## API Contract

Add `createRelease(owner, repo, payload)` in `scripts/github.js` using:
- `POST /repos/{owner}/{repo}/releases`

Payload fields:
- `tag_name` (required)
- `name` (optional)
- `body` (optional)
- `draft` (optional, boolean)
- `prerelease` (optional, boolean)

## Output

On success:
- print created tag/name and URL.

On failure:
- auth error, permission error, validation error message.

## Scope Notes

- No asset upload in this step.
- No interactive prompts in this step.
