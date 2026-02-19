## 1. GitHub API Functions

- [ ] 1.1 Add `fetchPRs(owner, repo, state)` function to github.js
- [ ] 1.2 Add `fetchPR(owner, repo, number)` function to github.js

## 2. Command Implementation

- [ ] 2.1 Add `cmdPr` function to commands.js for listing PRs
- [ ] 2.2 Add `pr view <number>` subcommand handling

## 3. Registration

- [ ] 3.1 Add `pr` to commands registry object
- [ ] 3.2 Add `pr` to tab completion command list
- [ ] 3.3 Add `pr` to help output under Repository section

## 4. Testing

- [ ] 4.1 Test `pr` command lists open PRs
- [ ] 4.2 Test `pr --all` lists all PRs
- [ ] 4.3 Test `pr view <number>` shows PR details
- [ ] 4.4 Test error handling (not in repo, PR not found)
