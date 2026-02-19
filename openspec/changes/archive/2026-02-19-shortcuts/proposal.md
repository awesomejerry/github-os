## Why

Users expect standard terminal keyboard shortcuts for efficient command-line editing and navigation. Currently, the terminal only supports Tab completion, arrow keys for history navigation, and Enter for command execution. Adding common shortcuts like Ctrl+L (clear), Ctrl+A (beginning of line), Ctrl+E (end of line), etc., will significantly improve user experience and productivity.

## What Changes

- Add Ctrl+L shortcut to clear terminal screen (calls `terminal.clear()`)
- Add Ctrl+U shortcut to clear the entire input line
- Add Ctrl+K shortcut to clear from cursor position to end of line
- Add Ctrl+A shortcut to move cursor to beginning of line
- Add Ctrl+E shortcut to move cursor to end of line
- Add Ctrl+R shortcut to initiate reverse search through command history
- Update help command to display available keyboard shortcuts

## Capabilities

### New Capabilities
- `keyboard-shortcuts`: Defines terminal keyboard shortcuts for line editing, navigation, and history search

### Modified Capabilities
- `terminal`: Extends terminal input handling to support keyboard shortcuts
- `commands`: Updates help command to show available shortcuts

## Impact

- `scripts/terminal.js`: Extend `setupEventListeners()` to handle new shortcuts
- `scripts/commands.js`: Update `cmdHelp()` to display shortcuts section
- `openspec/specs/terminal/spec.md`: Add shortcuts requirements
