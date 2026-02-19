## 1. GitHub API Write Functions

- [x] 1.1 Add getFile function to github.js (fetch file with SHA)
- [x] 1.2 Add createFile function to github.js (PUT /repos/{owner}/{repo}/contents/{path})
- [x] 1.3 Add deleteFile function to github.js (DELETE with SHA)
- [x] 1.4 Add updateFile function to github.js (PUT with SHA)
- [x] 1.5 Export new functions from github.js

## 2. File Operation Commands

- [x] 2.1 Implement cmdTouch function in commands.js
- [x] 2.2 Implement cmdMkdir function in commands.js
- [x] 2.3 Implement cmdRm function with confirmation in commands.js
- [x] 2.4 Implement cmdMv function in commands.js
- [x] 2.5 Implement cmdCp function in commands.js

## 3. Command Registration

- [x] 3.1 Register touch, mkdir, rm, mv, cp in command registry
- [x] 3.2 Update cmdHelp to include file operation commands
- [x] 3.3 Add new commands to tab completion list

## 4. Error Handling

- [x] 4.1 Add handleApiError helper for 401/403/404 responses
- [x] 4.2 Ensure all commands check isAuthenticated() first
- [x] 4.3 Clear cache after successful write operations
