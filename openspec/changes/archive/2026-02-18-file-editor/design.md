## Context

GitHub OS is a browser-based terminal emulator for browsing GitHub repositories. Currently users can only read files (cat, head, tail commands) but cannot edit them. This forces users to switch to GitHub.com for any file modifications.

The file editor will be a modal overlay that:
- Uses a textarea for text editing
- Loads file content via existing GitHub API
- Saves via GitHub Contents API (PUT /repos/{owner}/{repo}/contents/{path})
- Requires authentication for write operations

## Goals / Non-Goals

**Goals:**
- Provide in-terminal file editing capability
- Support basic text editing with save/cancel
- Use keyboard shortcuts (ESC, Ctrl+S) for efficient workflow
- Maintain consistent UI with existing terminal theme

**Non-Goals:**
- Advanced text editing features (syntax highlighting in editor, find/replace)
- Binary file editing
- Multi-file editing
- Offline editing / conflict resolution

## Decisions

### 1. Modal Overlay (JS-generated)
**Decision**: Create editor modal dynamically via JavaScript rather than static HTML.

**Rationale**: 
- Keeps index.html clean
- Follows pattern of other dynamic UI elements in the app
- Modal only exists when needed, saves DOM memory

**Alternatives considered**:
- Static HTML with display toggle: Rejected - adds unnecessary HTML bloat

### 2. Textarea over ContentEditable
**Decision**: Use native `<textarea>` element for editing.

**Rationale**:
- Simple implementation, handles all basic text editing
- Consistent behavior across browsers
- No need for rich text features

**Alternatives considered**:
- ContentEditable div: More complex, unnecessary for plain text
- Monaco/CodeMirror: Overkill for basic editing, adds external dependencies

### 3. GitHub Contents API for Save
**Decision**: Use PUT /repos/{owner}/{repo}/contents/{path} with SHA for updates.

**Rationale**:
- Standard GitHub API for file updates
- SHA requirement prevents race conditions
- Requires authentication token from session

**Alternatives considered**:
- Git Data API: More complex, requires tree manipulation

### 4. Base64 Encoding
**Decision**: Use native btoa() for Base64 encoding.

**Rationale**:
- GitHub API requires Base64-encoded content
- Native browser function, no dependencies

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Concurrent edits cause conflicts | SHA check will fail; show error message to user |
| Large files are slow to load | No explicit mitigation; reasonable for typical code files |
| UTF-8 encoding issues | Use TextEncoder/TextDecoder for proper handling |
| Token scope missing `repo` | Check scope before allowing edit; show helpful error |

## Migration Plan

No migration needed - this is a new feature. Rollback is simple: remove the `edit` command registration.
