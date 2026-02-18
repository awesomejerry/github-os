## 1. Staging Module

- [x] 1.1 Create scripts/staging.js module
- [x] 1.2 Implement getStagedChanges() function
- [x] 1.3 Implement stageCreate(path, content) function
- [x] 1.4 Implement stageUpdate(path, content, sha) function
- [x] 1.5 Implement stageDelete(path, sha) function
- [x] 1.6 Implement unstage(path) function
- [x] 1.7 Implement clearStaging() function
- [x] 1.8 Implement hasStagedChanges() function
- [x] 1.9 Add localStorage persistence with key 'github_os_staging'

## 2. GitHub API - Git Data

- [x] 2.1 Implement getBranchRef(owner, repo, branch) helper
- [x] 2.2 Implement getTreeFromCommit(owner, repo, commitSha) helper
- [x] 2.3 Implement createTree(owner, repo, baseTreeSha, entries) helper
- [x] 2.4 Implement createGitCommit(owner, repo, treeSha, parentSha, message) helper
- [x] 2.5 Implement updateBranchRef(owner, repo, branch, commitSha) helper
- [x] 2.6 Implement batchCommit(owner, repo, branch, changes, message) main function
- [x] 2.7 Add cache invalidation after batch commit
- [x] 2.8 Export new functions from github.js

## 3. Commands - Add

- [x] 3.1 Add cmdAdd function in commands.js
- [x] 3.2 Implement single file staging with `add <file>`
- [x] 3.3 Implement multiple file staging with `add file1 file2 ...`
- [x] 3.4 Handle file not found error
- [x] 3.5 Add authentication check
- [x] 3.6 Register 'add' command in commands registry

## 4. Commands - Diff

- [x] 4.1 Add cmdDiff function in commands.js
- [x] 4.2 Display staged creates with + prefix
- [x] 4.3 Display staged updates with +/- diff
- [x] 4.4 Display staged deletes with - prefix
- [x] 4.5 Show summary statistics (files, insertions, deletions)
- [x] 4.6 Handle empty staging area
- [x] 4.7 Register 'diff' command in commands registry

## 5. Commands - Commit

- [x] 5.1 Add cmdCommit function in commands.js
- [x] 5.2 Parse -m flag for commit message
- [x] 5.3 Validate message is provided
- [x] 5.4 Check for staged changes
- [x] 5.5 Get current branch for commit
- [x] 5.6 Call batchCommit API
- [x] 5.7 Display commit SHA and statistics
- [x] 5.8 Clear staging area after success
- [x] 5.9 Handle authentication error
- [x] 5.10 Register 'commit' command in commands registry

## 6. Update Help and Integration

- [x] 6.1 Update cmdHelp with add, diff, commit documentation
- [x] 6.2 Add completion entries for new commands
- [x] 6.3 Import staging module in app.js if needed
- [x] 6.4 Update tab completion list in getCompletions

## 7. Testing

- [x] 7.1 Create tests/unit/staging.test.js
- [x] 7.2 Test staging CRUD operations
- [x] 7.3 Test staging persistence
- [x] 7.4 Add batchCommit tests to tests/unit/github.test.js
- [x] 7.5 Test command handlers for add, diff, commit
