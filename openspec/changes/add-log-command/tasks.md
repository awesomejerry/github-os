## 1. API Layer

- [x] 1.1 Add `fetchRepoCommits(owner, repo, count)` function to github.js
- [x] 1.2 Add caching for commit data

## 2. Command Implementation

- [x] 1.3 Add `log` command to command registry in commands.js
- [x] 1.4 Implement `cmdLog` function with count parameter parsing
- [x] 1.5 Add error handling for non-repository context
- [x] 1.6 Format commit output with hash, author, date, and message

## 3. UI Polish

- [x] 1.7 Add relative date formatting utility function
- [x] 1.8 Add `log` to help command output
- [x] 1.9 Add `log` to tab completion list
