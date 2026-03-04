## Context

GitHub OS is a browser-based terminal emulator for navigating GitHub repositories. The existing `releases` command provides basic release listing functionality. This design adds comprehensive release management capabilities including creation, viewing details, editing, deletion, and asset management, following the command patterns established in previous phases.

The implementation follows existing patterns:
- Command signature: `function cmdRelease(terminal, githubUser, args)` with subcommands
- API functions in `github.js` with caching where appropriate
- Terminal output formatting with HTML classes
- Interactive prompts for missing information

## Goals / Non-Goals

**Goals:**
- Enable users to view detailed release information (body, assets, metadata)
- Enable users to create releases with optional assets
- Enable users to edit existing releases
- Enable users to delete releases
- Enable users to download release assets
- Enhance the existing `releases` list command with filters
- Maintain consistency with existing command patterns

**Non-Goals:**
- Automated release workflows (CI/CD integration)
- Release notes generation from commits
- Binary compilation or building
- Release templates or presets

## Decisions

### 1. Command Structure
**Decision**: Use `release` (singular) as the main command with subcommands, keeping `releases` (plural) for listing.

**Rationale**: 
- Aligns with existing pattern (`pr` vs `prs`, `issue` vs `issues`)
- Clear distinction between single release operations and listing
- Subcommands provide logical grouping of related operations

```
releases                  → list releases (existing)
releases --drafts         → list including drafts
releases --latest         → show latest release

release view <tag>        → show release details
release create <tag>      → create new release
release edit <tag>        → edit release
release delete <tag>      → delete release
release download <tag>    → download assets
release assets <tag>      → list assets
```

### 2. Interactive vs Flag-based Creation
**Decision**: Support both interactive prompts and flag-based creation.

**Rationale**: Provides flexibility for different workflows:
- Interactive: User-friendly for occasional use
- Flags: Scriptable for automation and power users

**Interactive Flow**:
```
$ release create v1.2.0
Target branch/commit [main]: 
Release title: Version 1.2.0
Release notes (markdown, Ctrl+D to finish):
[interactive markdown editor]
Is this a pre-release? (y/N): n
Is this a draft? (y/N): y
Attach assets? (y/N): n
```

**Flag-based Flow**:
```
$ release create v1.2.0 --target main --title "Version 1.2.0" --notes-file CHANGELOG.md --draft
```

### 3. Asset Management
**Decision**: Support file attachment with `--asset <path>` flag and interactive file selection.

**Rationale**:
- Browser environment limits direct filesystem access
- Use File System Access API where available
- Fall back to file input dialog for asset upload
- Download assets as browser downloads to user's download folder

**Limitation**: Asset upload in browser environment requires user file selection via dialog (cannot auto-attach local files without user interaction).

### 4. Release Notes Input
**Decision**: Support multiple input methods for release notes:
- `--notes "text"` - Inline text
- `--notes-file <path>` - Read from file
- Interactive multiline input with Ctrl+D to finish

**Rationale**: Accommodates different note lengths and sources. Short notes can be inline, detailed notes can come from CHANGELOG files.

### 5. Caching Strategy
**Decision**: Cache release list and individual releases. Invalidate cache on create/edit/delete operations.

**Rationale**: Release data is relatively static but changes when users perform operations.

**Cache Keys**:
- `releases:{owner}:{repo}` - Release list
- `release:{owner}:{repo}:{tag}` - Individual release
- `assets:{owner}:{repo}:{tag}` - Release assets

**Invalidation**:
- Clear list cache on create/delete
- Clear individual cache on edit
- Clear all release caches on `clearCache()` command

### 6. Error Handling
**Decision**: Graceful error messages for permission/validation scenarios.

**Rationale**: Clear errors improve UX for common failure cases.

**Error Scenarios**:
- 404: Release not found / No access
- 403: Missing `repo` scope (prompt to re-login)
- 422: Validation failed (tag already exists, invalid tag format)
- Rate limit: Show retry-after time

### 7. Download Handling
**Decision**: Download assets via browser download API, not terminal buffer.

**Rationale**:
- Assets can be large binary files
- Browser handles download progress and errors
- Terminal is for text output

**Implementation**: Use `window.open(asset.url)` or create temporary `<a>` element with `download` attribute.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Browser file upload limitations | Use File System Access API + file input dialog |
| Large asset downloads | Browser handles, show progress in terminal |
| Missing `repo` scope | Detect 403, prompt re-login with scope explanation |
| Tag already exists | Pre-check with API, show clear error message |
| Rate limits on frequent operations | Cache aggressively, show rate limit status |
| Draft release visibility | Filter drafts by default, require `--drafts` flag |

## Implementation Phases

**Phase 1** (MVP):
- `release view <tag>` - View release details
- `release assets <tag>` - List assets
- `releases --latest` - Show latest release

**Phase 2** (Creation/Editing):
- `release create <tag>` - Create with basic flags
- `release edit <tag>` - Edit title/notes
- Interactive creation flow

**Phase 3** (Advanced):
- `release delete <tag>` - Delete releases
- `release download <tag>` - Download assets
- Asset upload support
- `--notes-file` support
