# Editor Spec

## Overview

Built-in modal editor for editing files in the terminal.

## Requirements

### 1. Editor Modal
- Overlay covers entire screen
- Large textarea for content
- File name in header
- Save and Cancel buttons

### 2. Keyboard Shortcuts
- ESC - Cancel and close
- Ctrl+S - Save changes

### 3. File Loading
- Fetch file content from GitHub API
- Decode base64 content
- Handle binary files (show warning)

### 4. File Saving
- Stage changes (v2.2+)
- Or direct commit (v2.1)
- Show commit SHA on success

### 5. Error Handling
- Auth required message
- File not found
- Save failed

## Files

- `scripts/editor.js` - Editor implementation
- `styles/main.css` - Editor styles

## Status

✅ Implemented in v2.1.0
✅ Updated for staging in v2.2.0
