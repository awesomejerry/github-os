## Context

The terminal UI currently handles basic keyboard events: Enter (execute), Arrow Up/Down (history), and Tab (completion). The keydown handler in `terminal.js` processes these events. Adding more shortcuts requires extending this handler with Ctrl+key combinations for common line editing operations.

## Goals / Non-Goals

**Goals:**
- Implement standard Unix-like terminal shortcuts (Ctrl+L, Ctrl+A, Ctrl+E, Ctrl+U, Ctrl+K)
- Implement reverse history search (Ctrl+R)
- Update help command to document shortcuts
- Preserve existing shortcuts (Tab, Arrow keys, Enter)

**Non-Goals:**
- Full readline emulation
- Vim/Emacs editing modes
- Clipboard operations (Ctrl+C already handled differently)

## Decisions

1. **Use `e.ctrlKey && e.key` pattern**: Standard way to detect Ctrl combinations in JavaScript. Keep `e.preventDefault()` to prevent browser defaults.

2. **Ctrl+L calls `terminal.clear()`**: Direct call to existing clear method, consistent with `clear` command behavior.

3. **Ctrl+A/E use `selectionStart`/`setSelectionRange`**: Input element already supports these. No additional state needed.

4. **Ctrl+U/K manipulate input.value**: String slicing based on cursor position (`selectionStart`).

5. **Ctrl+R triggers incremental history search**: When pressed, enter search mode where typing filters history. Pressing Ctrl+R again cycles through matches, Enter selects, Escape cancels.

6. **Keep Ctrl+C as-is**: Already used for cancellation. Don't override.

## Risks / Trade-offs

- **Browser shortcuts conflict**: Ctrl+L normally focuses address bar. We preventDefault() to capture it. Trade-off is acceptable for terminal emulation.
- **Ctrl+R search complexity**: Full implementation requires search mode state management. Starting with basic implementation that shows "Search: " prompt.
