## 1. GitHub API Functions

- [x] 1.1 Add `getDefaultBranchSHA(owner, repo)` to github.js
- [x] 1.2 Add `createBranch(owner, repo, name, sha)` to github.js
- [x] 1.3 Add `deleteBranch(owner, repo, name)` to github.js
- [x] 1.4 Export new functions from github.js

## 2. Command Implementation

- [x] 2.1 Extend `cmdBranch` to handle `-c <name>` flag for creating branches
- [x] 2.2 Extend `cmdBranch` to handle `-d <name>` flag for deleting branches
- [x] 2.3 Add authentication check for create/delete operations
- [x] 2.4 Add `cmdCheckout` command to switch branch context
- [x] 2.5 Register `checkout` command in commands registry

## 3. State Management

- [x] 3.1 Add `currentBranch` tracking to terminal.js
- [x] 3.2 Add getter/setter for current branch in terminal.js
- [x] 3.3 Update prompt to optionally show current branch

## 4. Cache Management

- [x] 4.1 Add `clearBranchCache(owner, repo)` function to github.js
- [x] 4.2 Clear branch cache after create/delete operations
- [x] 4.3 Clear tree/contents cache after checkout

## 5. Help Documentation

- [x] 5.1 Update help text for `branch` command with new flags
- [x] 5.2 Add `checkout` command to help text
