## 1. GitHub API Functions

- [x] 1.1 Add createPR function to scripts/github.js
- [x] 1.2 Add mergePR function to scripts/github.js
- [x] 1.3 Add closePR function to scripts/github.js
- [x] 1.4 Add fetchPR function to retrieve PR details (optional helper)

## 2. Command Handlers

- [x] 2.1 Add pr command to commands registry
- [x] 2.2 Implement pr create subcommand with interactive mode
- [x] 2.3 Implement pr create subcommand with direct mode (-t and -b flags)
- [x] 2.4 Implement pr merge subcommand with confirmation flow
- [x] 2.5 Implement pr close subcommand with confirmation flow
- [x] 2.6 Add branch detection for PR creation (head/base)
- [x] 2.7 Add loading states for all PR operations

## 3. Error Handling

- [x] 3.1 Map GitHub API errors to user-friendly messages
- [x] 3.2 Add authentication check before PR operations
- [x] 3.3 Handle network failures gracefully
- [x] 3.4 Handle merge conflicts error
- [x] 3.5 Handle permission denied error
- [x] 3.6 Handle PR not found error

## 4. Output Formatting

- [x] 4.1 Format PR creation success message with number and URL
- [x] 4.2 Format PR merge success message with commit SHA
- [x] 4.3 Format PR close success message
- [x] 4.4 Add confirmation prompts for merge and close operations

## 5. Integration & Testing

- [ ] 5.1 Test pr create interactive mode with authenticated session
- [ ] 5.2 Test pr create direct mode with flags
- [ ] 5.3 Test pr merge with confirmation flow
- [ ] 5.4 Test pr close with confirmation flow
- [ ] 5.5 Test error handling for unauthenticated users
- [ ] 5.6 Test error handling for non-existent PRs
- [ ] 5.7 Test branch detection logic
