# Shared Decisions - GitHub OS v2.3 - Phase 7 & 8

> 所有 Pull Request 和 UX 功能必須遵守此文件定義的規範

---

## Phase 7: Pull Requests Workflow

### 1. PR Commands

```bash
pr                  # List open PRs
pr --all            # List all PRs (including closed)
pr view <number>    # View PR details
pr create           # Interactive PR creation
pr create -t "title" -b "body"  # Direct PR creation
pr merge <number>   # Merge PR (with confirmation)
pr close <number>   # Close PR (with confirmation)
pr checkout <number># Checkout PR branch locally
```

### 2. PR List Output

```bash
$ pr

Pull Requests for owner/repo:

#42 Add staging workflow [feature/staging] by awesomejerry
   Status: open | +150 -23 | 3 comments

#40 Fix encoding issue [bugfix/encoding] by contributor
   Status: open | +12 -5 | 0 comments

2 open PR(s)
```

### 3. PR View Output

```bash
$ pr view 42

PR #42: Add staging workflow
Status: open
Author: awesomejerry
Branch: feature/staging → main
Created: 2 days ago

Description:
This PR adds git-like staging workflow...

Files changed: 15
 +450 -120

Commits: 8
Comments: 3

[View on GitHub] [Checkout] [Merge] [Close]
```

### 4. PR Create Flow

```bash
$ pr create

Creating Pull Request...

Current branch: feature/new-feature
Base branch: main (default)

Title: Add new feature
Body: (opens editor or reads from -b flag)

Creating PR...
✓ PR #43 created: https://github.com/owner/repo/pull/43
```

### 5. GitHub API Endpoints

```javascript
// List PRs
GET /repos/{owner}/{repo}/pulls?state=open

// Get PR details
GET /repos/{owner}/{repo}/pulls/{number}

// Create PR
POST /repos/{owner}/{repo}/pulls
Body: { title, body, head, base }

// Merge PR
PUT /repos/{owner}/{repo}/pulls/{number}/merge
Body: { commit_title, merge_method }

// Close PR
PATCH /repos/{owner}/{repo}/pulls/{number}
Body: { state: "closed" }
```

---

## Phase 8: UX Polish

### 1. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+L` | Clear screen |
| `Ctrl+C` | Cancel current input |
| `Ctrl+U` | Clear input line |
| `Ctrl+K` | Clear from cursor to end |
| `Ctrl+A` | Go to line start |
| `Ctrl+E` | Go to line end |
| `Ctrl+R` | Search history |
| `Ctrl+Shift+C` | Copy selected text |
| `Ctrl+Shift+V` | Paste |

### 2. Themes

```bash
theme               # Show current theme
theme list          # List available themes
theme set <name>    # Set theme
theme custom        # Open theme editor

Available themes:
- dark (default)
- light
- solarized-dark
- solarized-light
- monokai
- gruvbox
```

### 3. Theme Structure

```javascript
// localStorage key: github_os_theme
{
  name: "dark",
  colors: {
    background: "#0d1117",
    foreground: "#c9d1d9",
    prompt: "#58a6ff",
    success: "#3fb950",
    error: "#f85149",
    warning: "#d29922",
    info: "#58a6ff",
    directory: "#58a6ff",
    file: "#8b949e",
    syntax: {
      keyword: "#ff7b72",
      string: "#a5d6ff",
      comment: "#8b949e",
      number: "#79c0ff"
    }
  }
}
```

### 4. Auto-completion Improvements

- Fuzzy search for commands
- Context-aware suggestions
- Show descriptions in completions
- Cache completion results

### 5. Performance Optimizations

- Lazy load large directories
- Cache repo info aggressively
- Debounce API calls
- Show loading states
- Progressive rendering for large outputs

---

## File Structure

```
scripts/
├── commands.js      # Add pr commands, theme command
├── github.js        # Add PR API functions
├── themes.js        # NEW - Theme management
├── shortcuts.js     # NEW - Keyboard shortcuts
└── autocomplete.js  # NEW - Improved autocomplete

styles/
└── themes/
    ├── dark.css
    ├── light.css
    ├── solarized-dark.css
    └── ...
```

---

## 並行開發計劃

| Worktree | 功能 | 主要檔案 |
|----------|------|---------|
| github-os-pr-list | PR listing and viewing | commands.js, github.js |
| github-os-pr-ops | PR create, merge, close | commands.js, github.js |
| github-os-themes | Theme system | themes.js, styles/themes/ |
| github-os-shortcuts | Keyboard shortcuts | shortcuts.js, terminal.js |

---

## 驗證清單

After merging, verify:

```bash
# PR commands work
pr                  # Should list PRs
pr view 42          # Should show PR details
pr create           # Should start interactive flow

# Theme commands work
theme list          # Should show themes
theme set light     # Should change theme

# Shortcuts work
Ctrl+L              # Should clear screen
Ctrl+C              # Should cancel input

# Integration tests
grep "cmdPr\|fetchPRs\|createPR" scripts/commands.js scripts/github.js
grep "setTheme\|loadTheme" scripts/themes.js scripts/commands.js
```

---

*Last updated: 2026-02-19*
*Version: v2.3-alpha*
