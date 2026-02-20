# GitHub OS User Guide

> **Version:** v2.4.0
> **Last Updated:** 2026-02-20

---

## Quick Start

1. Open [GitHub OS](https://www.awesomejerry.space/github-os/)
2. Type `connect <username>` to browse a user's repos
3. Use `cd` to navigate, `ls` to list contents, `cat` to read files

---

## Authentication

### Login
```bash
login
```
Starts GitHub OAuth flow. Authorize to access private repos and make changes.

### Logout
```bash
logout
```
Ends your session.

### Check Status
```bash
status
```
Shows login status and rate limits.

---

## Navigation Commands

### ls [path]
List directory contents.

```bash
ls              # List current directory
ls src/         # List specific path
ls -la          # List with details (coming soon)
```

### cd <path>
Change directory.

```bash
cd my-repo      # Enter repository
cd src          # Enter subdirectory
cd ..           # Go up one level
cd /            # Go to root
```

### pwd
Print current directory.

```bash
pwd
# Output: /username/repo/src
```

### tree [path]
Display directory tree.

```bash
tree            # Show current directory tree
tree src/       # Show specific path tree
```

---

## File Operations

### Reading Files

#### cat <file>
Display file contents.

```bash
cat README.md
cat src/index.js
```

#### head <file> [lines]
Show first N lines (default: 10).

```bash
head README.md
head package.json 20
```

#### tail <file> [lines]
Show last N lines (default: 10).

```bash
tail CHANGELOG.md
tail src/app.js 30
```

---

## Editing Files

### edit <file>
Open file in built-in editor.

```bash
edit README.md
```

**Editor Controls:**
- `Ctrl+S` - Save (stages changes)
- `Esc` - Cancel

---

## Staging Workflow

Stage changes before committing them together.

### Stage Changes

```bash
touch new-file.txt     # Stage new file
edit existing.txt      # Stage modifications
rm old-file.txt        # Stage deletions
```

### Check Staged Changes

```bash
status
```
Shows:
- Authentication status
- Staged changes (new, modified, deleted)

### Unstage

```bash
unstage <file>         # Remove specific file from staging
unstage --all          # Clear all staged changes
```

### Commit

```bash
commit -m "Your commit message"
```
Commits all staged changes in one commit.

---

## Branch Operations

### List Branches

```bash
branch
```
Shows all branches with default marked.

### Create Branch

```bash
branch -c feature/new-feature
```

### Delete Branch

```bash
branch -d old-feature
```

### Switch Branch

```bash
checkout main
checkout feature/test
```

---

## Pull Requests

### List PRs

```bash
pr                  # Open PRs
pr --all            # All PRs (including closed)
```

### View PR

```bash
pr view 42
```
Shows PR details: title, status, author, files changed.

### Create PR

```bash
pr create
```
Interactive mode - prompts for title and body.

```bash
pr create -t "Add feature" -b "Description here"
```
Direct mode with flags.

### Merge PR

```bash
pr merge 42
```
Requires confirmation.

### Close PR

```bash
pr close 42
```
Requires confirmation.

---

## Issues

### List Issues

```bash
issues              # Open issues
issues --all        # All issues
```

### View Issue

```bash
issues view 42
```

### Create Issue

```bash
issues create -t "Bug title" -b "Bug description"
```

### Close Issue

```bash
issues close 42
```

### Comment on Issue

```bash
issues comment 42 "Your comment here"
```

---

## Themes

### View Current Theme

```bash
theme
```

### List Available Themes

```bash
theme list
```
Available: dark, light, solarized-dark, solarized-light, monokai, gruvbox

### Set Theme

```bash
theme set light
theme set monokai
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+L` | Clear screen |
| `Ctrl+U` | Clear input line |
| `Ctrl+K` | Clear to end of line |
| `Ctrl+A` | Go to line start |
| `Ctrl+E` | Go to line end |
| `↑` | Previous command |
| `↓` | Next command |
| `Tab` | Auto-complete |

---

## Other Commands

### Find Files

```bash
find "*.js"          # Find all JS files
find "test*"         # Find files starting with "test"
```

### Search in Files

```bash
grep "pattern"       # Search in current directory
```

### View Commit History

```bash
log                  # Last 10 commits
log 20               # Last 20 commits
```

### View Repo Info

```bash
info                 # Repository details
```

### View Contributors

```bash
contributors         # List contributors
contributors 50      # Top 50
```

### View Releases

```bash
releases             # List releases
releases 20          # Last 20 releases
```

---

## Rate Limits

| Mode | Limit |
|------|-------|
| Unauthenticated | 60 requests/hour |
| Authenticated | 5000 requests/hour |

Use `status` to check remaining requests.

---

## Tips

1. **Use Tab completion** - Press Tab to auto-complete commands and paths
2. **Stage multiple changes** - Make several edits, then commit once
3. **Check status often** - Always know what's staged
4. **Use themes** - Customize your terminal experience
5. **Branch before editing** - Create a feature branch for changes

---

## Troubleshooting

### "Authentication required"
Run `login` first.

### "Rate limit exceeded"
Wait for limit to reset. Use `status` to see reset time.

### "File not found"
Check your current directory with `pwd`.

### "Branch not found"
Use `branch` to see available branches.

---

## Support

- GitHub: [github.com/awesomejerry/github-os](https://github.com/awesomejerry/github-os)
- Issues: Report bugs or request features

---

*GitHub OS - Make GitHub feel like home.* 🏠
