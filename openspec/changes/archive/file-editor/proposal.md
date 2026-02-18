## Why

Users need to edit files directly in the GitHub OS terminal without switching to GitHub.com. Currently users can only view files (cat, head, tail) but cannot modify them. This creates friction for quick edits and requires context switching to the GitHub web interface.

## What Changes

- **NEW** `edit <file>` command - Opens file in a built-in modal editor
- **NEW** Editor modal overlay - Full-screen modal with textarea for editing
- **NEW** Save functionality - Commits changes directly to GitHub via API
- Keyboard shortcuts: ESC to cancel, Ctrl+S to save

## Capabilities

### New Capabilities
- `editor`: Built-in file editor with modal UI, textarea editing, and GitHub API save functionality

### Modified Capabilities
- `commands`: Add new `edit` command to command registry

## Impact

- **New file**: `scripts/editor.js` - Editor modal logic and GitHub save API
- **Modified file**: `scripts/commands.js` - Add cmdEdit function
- **Modified file**: `styles/main.css` - Editor modal styles
- Requires authentication (uses session token for GitHub API write operations)
