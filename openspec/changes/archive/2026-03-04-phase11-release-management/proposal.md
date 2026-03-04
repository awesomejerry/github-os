## Why

GitHub OS currently provides a basic `releases` command that only lists repository releases. Users need comprehensive release management capabilities to create, view, download, and manage releases directly from the terminal. This eliminates the need to switch to GitHub's web interface for release operations, improving developer productivity and workflow continuity.

## What Changes

- **Enhanced Release Commands**:
  - `release view <tag>` - View detailed release information (body, assets, downloads)
  - `release create <tag>` - Create a new release (interactive or with flags)
  - `release edit <tag>` - Edit release details (name, body, draft/pre-release flags)
  - `release delete <tag>` - Delete a release
  - `release download <tag>` - Download release assets
  - `release assets <tag>` - List release assets with download counts

- **Release Creation Flags**:
  - `--title "Release Name"` - Set release title
  - `--notes "Release notes"` - Set release body/notes
  - `--draft` - Mark as draft release
  - `--prerelease` - Mark as pre-release
  - `--target <branch>` - Target branch or commit
  - `--asset <file>` - Attach release asset (multiple allowed)

- **Enhanced Existing Command**:
  - `releases` - Keep current functionality for listing
  - Add `releases --drafts` to show draft releases
  - Add `releases --latest` to show only latest release

- **API Integration**:
  - New GitHub API endpoints for release CRUD operations
  - Asset upload/download capabilities
  - Requires `repo` OAuth scope for write operations

## Capabilities

### New Capabilities

- `release-management`: Complete release lifecycle management including create, view, edit, delete, and download operations

### Modified Capabilities

- `releases-command`: Enhanced with additional flags for drafts and latest release filtering
- `github-api`: Extended with release CRUD and asset management endpoints

## Impact

**Affected Files**:
- `scripts/commands.js` - New cmdRelease function with subcommands (view, create, edit, delete, download, assets)
- `scripts/github.js` - New API functions for release operations
- `scripts/app.js` - Potential file download handling

**API Endpoints** (new):
- `GET /repos/{owner}/{repo}/releases/{release_id}` - Get release details
- `POST /repos/{owner}/{repo}/releases` - Create release
- `PATCH /repos/{owner}/{repo}/releases/{release_id}` - Update release
- `DELETE /repos/{owner}/{repo}/releases/{release_id}` - Delete release
- `GET /repos/{owner}/{repo}/releases/tags/{tag}` - Get release by tag
- `GET /repos/{owner}/{repo}/releases/latest` - Get latest release
- `GET /repos/{owner}/{repo}/releases/{release_id}/assets` - List assets
- `POST /repos/{owner}/{repo}/releases/{release_id}/assets` - Upload asset
- `GET /repos/{owner}/{repo}/releases/assets/{asset_id}` - Get asset info

**Authentication**:
- Read operations: `public_repo` or `repo` scope
- Write operations (create/edit/delete): `repo` scope
- Asset upload/download: `repo` scope

**Tests**:
- New test file: `tests/unit/release-management.test.js`
- Update existing: `tests/unit/releases.test.js`
