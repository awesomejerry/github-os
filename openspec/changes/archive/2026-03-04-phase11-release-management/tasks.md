## 1. GitHub API Functions (github.js)

- [ ] 1.1 Add `fetchRelease(owner, repo, tag)` function - GET /repos/{owner}/{repo}/releases/tags/{tag}
- [ ] 1.2 Add `fetchReleaseById(owner, repo, releaseId)` function - GET /repos/{owner}/{repo}/releases/{release_id}
- [ ] 1.3 Add `fetchLatestRelease(owner, repo)` function - GET /repos/{owner}/{repo}/releases/latest
- [ ] 1.4 Add `createRelease(owner, repo, options)` function - POST /repos/{owner}/{repo}/releases
- [ ] 1.5 Add `updateRelease(owner, repo, releaseId, options)` function - PATCH /repos/{owner}/{repo}/releases/{release_id}
- [ ] 1.6 Add `deleteRelease(owner, repo, releaseId)` function - DELETE /repos/{owner}/{repo}/releases/{release_id}
- [ ] 1.7 Add `fetchReleaseAssets(owner, repo, releaseId)` function - GET /repos/{owner}/{repo}/releases/{release_id}/assets
- [ ] 1.8 Add caching for individual releases and assets
- [ ] 1.9 Add cache invalidation on create/update/delete operations

## 2. Command Functions (commands.js)

- [ ] 2.1 Add `cmdRelease(terminal, githubUser, args)` function as main command router
- [ ] 2.2 Implement `release view <tag>` - Display release details (body, assets, metadata)
- [ ] 2.3 Implement `release create <tag>` - Create new release
- [ ] 2.4 Implement `release edit <tag>` - Edit release title/notes/draft/prerelease
- [ ] 2.5 Implement `release delete <tag>` - Delete release with confirmation
- [ ] 2.6 Implement `release download <tag>` - Download release assets
- [ ] 2.7 Implement `release assets <tag>` - List release assets with download counts
- [ ] 2.8 Add `--title` flag support for create/edit
- [ ] 2.9 Add `--notes` flag support for create/edit
- [ ] 2.10 Add `--notes-file` flag support for create/edit
- [ ] 2.11 Add `--draft` flag support for create/edit
- [ ] 2.12 Add `--prerelease` flag support for create/edit
- [ ] 2.13 Add `--target` flag support for create
- [ ] 2.14 Add `--asset` flag support for create
- [ ] 2.15 Update `cmdReleases` to support `--drafts` flag
- [ ] 2.16 Update `cmdReleases` to support `--latest` flag
- [ ] 2.17 Register `release` command in command registry
- [ ] 2.18 Update help output with Release Management section
- [ ] 2.19 Add `release` to tab completion list

## 3. Enhanced Releases Command (commands.js)

- [ ] 3.1 Add `--drafts` flag to include draft releases in list
- [ ] 3.2 Add `--latest` flag to show only latest release with details
- [ ] 3.3 Update release list display to show draft indicator

## 4. Interactive Input Handling (commands.js or new input.js)

- [ ] 4.1 Add interactive multiline text input for release notes
- [ ] 4.2 Add confirmation prompt for delete operation
- [ ] 4.3 Add file selection dialog for asset upload
- [ ] 4.4 Add interactive prompts for missing required fields in create

## 5. Asset Download (app.js or commands.js)

- [ ] 5.1 Add asset download handler using browser download API
- [ ] 5.2 Add download progress indicator in terminal
- [ ] 5.3 Handle download errors gracefully

## 6. Asset Upload (github.js + commands.js)

- [ ] 6.1 Add `uploadReleaseAsset(owner, repo, releaseId, file)` function
- [ ] 6.2 Integrate File System Access API for file selection
- [ ] 6.3 Add upload progress indicator in terminal
- [ ] 6.4 Handle upload errors gracefully

## 7. Tests (tests/unit/release-management.test.js)

- [ ] 7.1 Test `fetchRelease()` returns release details
- [ ] 7.2 Test `fetchLatestRelease()` returns latest release
- [ ] 7.3 Test `createRelease()` creates release successfully
- [ ] 7.4 Test `updateRelease()` updates release successfully
- [ ] 7.5 Test `deleteRelease()` deletes release successfully
- [ ] 7.6 Test `fetchReleaseAssets()` returns asset list
- [ ] 7.7 Test `cmdRelease view` displays release information
- [ ] 7.8 Test `cmdRelease create` with flags
- [ ] 7.9 Test `cmdRelease edit` with flags
- [ ] 7.10 Test `cmdRelease delete` with confirmation
- [ ] 7.11 Test `cmdRelease assets` lists assets
- [ ] 7.12 Test `cmdReleases --drafts` includes drafts
- [ ] 7.13 Test `cmdReleases --latest` shows latest release
- [ ] 7.14 Test error handling for missing `repo` scope
- [ ] 7.15 Test error handling for duplicate tag
- [ ] 7.16 Test cache invalidation on create/edit/delete

## 8. Documentation

- [ ] 8.1 Update shared-decisions.md with Phase 11 Release Management patterns
- [ ] 8.2 Add usage examples to README or docs
- [ ] 8.3 Document OAuth scope requirements

## 9. Delta Specs (openspec/changes/phase11-release-management/specs/)

- [ ] 9.1 Create delta spec for `release-management` capability
- [ ] 9.2 Update delta spec for `releases-command` capability
- [ ] 9.3 Update delta spec for `github-api` capability
