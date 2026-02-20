# GitHub OS Command Reference

> **Version:** v2.4.0
> **Last Updated:** 2026-02-20

---

## Navigation

### `ls [path]`
List directory contents.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| path | string | No | Directory path to list |

**Examples:**
```bash
ls
ls src/
ls /username/repo
```

---

### `cd <path>`
Change current directory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| path | string | Yes | Directory path |

**Special paths:**
- `..` - Parent directory
- `/` - Root directory
- `-` - Previous directory

---

### `pwd`
Print working directory.

**Output:** Full path like `/username/repo/src`

---

### `tree [path]`
Display directory tree.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| path | string | No | Directory to show |

---

## File Reading

### `cat <file>`
Display file contents.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | string | Yes | File path |

---

### `head <file> [lines]`
Show first N lines.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| file | string | Yes | - | File path |
| lines | number | No | 10 | Number of lines |

---

### `tail <file> [lines]`
Show last N lines.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| file | string | Yes | - | File path |
| lines | number | No | 10 | Number of lines |

---

## File Operations (Requires Login)

### `touch <file>`
Create new file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | string | Yes | File path |

**Stages:** Creates staged change

---

### `mkdir <dir>`
Create directory.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| dir | string | Yes | Directory path |

**Stages:** Creates `.gitkeep` file

---

### `rm <file>`
Delete file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | string | Yes | File path |

**Confirmation:** Requires "yes" confirmation

**Stages:** Creates staged deletion

---

### `mv <source> <dest>`
Move/rename file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| source | string | Yes | Source path |
| dest | string | Yes | Destination path |

**Stages:** Delete + Create

---

### `cp <source> <dest>`
Copy file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| source | string | Yes | Source path |
| dest | string | Yes | Destination path |

**Stages:** Creates staged file

---

### `edit <file>`
Open file in editor.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | string | Yes | File path |

**Controls:**
- `Ctrl+S` - Save (stages changes)
- `Esc` - Cancel

---

## Staging

### `add <file>`
Stage file changes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | string | Yes | File to stage |

---

### `diff`
Show staged changes.

---

### `unstage <file>`
Remove file from staging.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | string | Yes | File to unstage |

---

### `unstage --all`
Clear all staged changes.

---

### `commit -m <message>`
Commit staged changes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| -m | flag | Yes | Message flag |
| message | string | Yes | Commit message |

**Example:**
```bash
commit -m "Add new feature"
```

---

## Branches

### `branch`
List branches.

**Output:** Branch list with current marked

---

### `branch -c <name>`
Create branch.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| -c | flag | Yes | Create flag |
| name | string | Yes | Branch name |

---

### `branch -d <name>`
Delete branch.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| -d | flag | Yes | Delete flag |
| name | string | Yes | Branch name |

---

### `checkout <branch>`
Switch branch.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| branch | string | Yes | Branch name |

---

## Pull Requests

### `pr [--all]`
List pull requests.

| Flag | Description |
|------|-------------|
| --all | Include closed PRs |

---

### `pr view <number>`
View PR details.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | number | Yes | PR number |

---

### `pr create [-t <title>] [-b <body>]`
Create pull request.

| Flag | Parameter | Description |
|------|-----------|-------------|
| -t | title | PR title |
| -b | body | PR description |

**Interactive mode:** Without flags, prompts for input

---

### `pr merge <number>`
Merge pull request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | number | Yes | PR number |

**Confirmation:** Requires "yes"

---

### `pr close <number>`
Close pull request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | number | Yes | PR number |

**Confirmation:** Requires "yes"

---

## Issues

### `issues [--all]`
List issues.

| Flag | Description |
|------|-------------|
| --all | Include closed issues |

---

### `issues view <number>`
View issue details.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | number | Yes | Issue number |

---

### `issues create -t <title> -b <body>`
Create issue.

| Flag | Parameter | Required | Description |
|------|-----------|----------|-------------|
| -t | title | Yes | Issue title |
| -b | body | No | Issue description |

---

### `issues close <number>`
Close issue.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | number | Yes | Issue number |

---

### `issues comment <number> <text>`
Add comment to issue.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| number | number | Yes | Issue number |
| text | string | Yes | Comment text |

---

## Themes

### `theme`
Show current theme.

---

### `theme list`
List available themes.

**Available:** dark, light, solarized-dark, solarized-light, monokai, gruvbox

---

### `theme set <name>`
Set theme.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Theme name |

---

## Authentication

### `login`
Start OAuth login flow.

---

### `logout`
End session.

---

### `status`
Show authentication status and rate limits.

---

## Search

### `find <pattern>`
Find files by pattern.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pattern | string | Yes | Glob pattern |

**Example:**
```bash
find "*.js"
find "test*"
```

---

### `grep <pattern>`
Search in files.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pattern | string | Yes | Search pattern |

---

## Info

### `info`
Show repository information.

---

### `log [count]`
Show commit history.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| count | number | No | 10 | Number of commits |

---

### `contributors [count]`
List contributors.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| count | number | No | 20 | Number of contributors |

---

### `releases [count]`
List releases.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| count | number | No | 10 | Number of releases |

---

## Misc

### `clear`
Clear terminal screen.

---

### `help`
Show help message.

---

### `whoami`
Show current GitHub user.

---

### `connect <username>`
Connect to different GitHub user.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | GitHub username |

---

### `exit`
Close terminal (shows message).

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

*End of Command Reference*
