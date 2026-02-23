## Why

The issues management commands already exist but the output format needs to be updated to match Phase 10 specifications. The current implementation shows a simple single-line format, while Phase 10 requires a richer multi-line format with status indicators, comment counts, and update timestamps.

## What Changes

- Update `issues` list output to show multi-line format with status, comments, and update time
- Ensure `issues --all` lists all issues including closed
- Ensure `issues view <number>` shows complete issue details
- Ensure `issues create -t "title" -b "body"` creates issues directly
- Ensure `issues create` prompts interactively for title/body
- Ensure `issues close <number>` requires confirmation (like pr merge)
- Ensure `issues reopen <number>` works with confirmation
- Ensure `issues comment <number> "text"` adds comments

## Capabilities

### New Capabilities
- None - the capability already exists

### Modified Capabilities
- `issues-management`: Update output format to match Phase 10 spec (status line, comments count, updated time)

## Impact

- `scripts/commands.js` - Update `listIssues` function to use Phase 10 output format
- `scripts/github.js` - May need to add `comments` and `updated_at` to issue list response
- `tests/unit/issues.test.js` - Update tests for new output format
