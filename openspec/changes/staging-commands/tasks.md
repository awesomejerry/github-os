## 1. Core Staging Module

- [x] 1.1 Create `scripts/staging.js` with localStorage key `github_os_staged_changes`
- [x] 1.2 Implement `stageCreate(owner, repo, path, content)` function
- [x] 1.3 Implement `stageUpdate(owner, repo, path, content, sha)` function
- [x] 1.4 Implement `stageDelete(owner, repo, path, sha)` function
- [x] 1.5 Implement `getStagedChanges()` function
- [x] 1.6 Implement `unstageFile(path)` function
- [x] 1.7 Implement `clearStaging()` function
- [x] 1.8 Implement `commitStaged(token, message)` function with batch API calls

## 2. Modify Existing Commands

- [x] 2.1 Update `cmdTouch` to call `stageCreate()` instead of `createFile()`
- [x] 2.2 Update `cmdMkdir` to call `stageCreate()` with .gitkeep content
- [x] 2.3 Update `cmdRm` to call `stageDelete()` after confirmation
- [x] 2.4 Update `cmdMv` to call `stageDelete()` + `stageCreate()`
- [x] 2.5 Update `cmdCp` to call `stageCreate()` with source content
- [x] 2.6 Update `cmdEdit` to call `stageUpdate()` on save
- [x] 2.7 Update `cmdStatus` to display staged changes with +/-/~ indicators

## 3. New Commands

- [x] 3.1 Implement `cmdUnstage` for `unstage <path>` and `unstage --all`
- [x] 3.2 Implement `cmdCommit` for `commit -m "message"`
- [x] 3.3 Add `unstage` and `commit` to command registry

## 4. Help Documentation

- [x] 4.1 Update `cmdHelp` to document new staging workflow
- [x] 4.2 Add `unstage` and `commit` to help output

## 5. Import Integration

- [x] 5.1 Add staging.js import to commands.js
- [x] 5.2 Export staging functions from staging.js

## 6. Testing

- [x] 6.1 Add unit tests for staging.js functions
- [ ] 6.2 Update command tests for staging behavior
