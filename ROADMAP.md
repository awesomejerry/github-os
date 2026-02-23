# GitHub OS Roadmap

> **Current Version:** v2.4.3  
> **Vision:** Make GitHub feel like a native filesystem you can navigate, explore, and interact with through a familiar terminal interface.

---

## 🎯 Design Philosophy

- **Terminal-first** - Authentic CLI experience, not a web app disguised as terminal
- **Zero-setup** - Works instantly, no backend, no auth required for basics
- **Progressive enhancement** - Optional auth unlocks more features
- **Keyboard-driven** - Power users should never need a mouse

---

## 📦 Phase 5: Authentication & Private Repos (v2.0) ✅

**Theme:** Unlock the full GitHub API

**Status:** Complete

### Features Implemented

| Feature | Description | Status |
|---------|-------------|--------|
| **OAuth Login** | GitHub OAuth PKCE flow | ✅ |
| **Private Repos** | Access your private repositories | ✅ |
| **Rate Limit Relief** | 5000 req/hour vs 60 req/hour | ✅ |
| **Session Persistence** | Stay logged in across visits | ✅ |

### Commands
- `login` - Start OAuth flow
- `logout` - End session
- `status` - Show auth status & rate limits

---

## 📝 Phase 6: Write Operations (v2.1) ✅

**Theme:** From read-only to read-write

**Status:** Complete

### Features Implemented

| Feature | Description | Status |
|---------|-------------|--------|
| **File Operations** | touch, mkdir, rm, mv, cp | ✅ |
| **File Editor** | Built-in modal editor | ✅ |
| **Branch Operations** | branch, checkout | ✅ |

### Commands
- `touch <file>` - Create new file
- `mkdir <dir>` - Create directory
- `rm <file>` - Delete file
- `mv <src> <dest>` - Move/rename
- `cp <src> <dest>` - Copy
- `edit <file>` - Open in editor
- `branch` - List branches
- `branch -c <name>` - Create branch
- `branch -d <name>` - Delete branch
- `checkout <branch>` - Switch branch

---

## 🔄 Phase 6.5: Staging Workflow (v2.2) ✅

**Theme:** Git-like staging area

**Status:** Complete

### Features Implemented

| Feature | Description | Status |
|---------|-------------|--------|
| **Staging Area** | Stage changes before commit | ✅ |
| **Batch Commit** | Commit multiple changes at once | ✅ |
| **Status Enhanced** | Show staged changes | ✅ |

### Commands
- `add <file>` - Stage file changes
- `unstage <file>` - Remove from staging
- `diff` - Show staged diff
- `commit -m "msg"` - Batch commit all staged changes
- `status` - Show auth + staged changes

### Workflow
```bash
touch file.txt     # Staged: new file
edit config.js     # Staged: modified
status             # Shows 2 staged changes
commit -m "Add feature"  # Batch commit
```

---

## 🔀 Phase 7: Pull Requests (v2.3) ✅

**Theme:** Full PR workflow

**Status:** Complete

### Features Implemented

| Feature | Description | Status |
|---------|-------------|--------|
| **List PRs** | View open/all pull requests | ✅ |
| **View PR** | Detailed PR information | ✅ |
| **Create PR** | Interactive or direct creation | ✅ |
| **Merge PR** | Merge with confirmation | ✅ |
| **Close PR** | Close with confirmation | ✅ |

### Commands
- `pr` - List open PRs
- `pr --all` - List all PRs (including closed)
- `pr view <number>` - View PR details
- `pr create` - Create PR interactively
- `pr create -t "title" -b "body"` - Create PR directly
- `pr merge <number>` - Merge PR (requires confirmation)
- `pr close <number>` - Close PR (requires confirmation)

---

## 🎨 Phase 8: UX Polish (v2.3) ✅

**Theme:** Better user experience

**Status:** Complete

### Features Implemented

| Feature | Description | Status |
|---------|-------------|--------|
| **Theme System** | 6 color themes | ✅ |
| **Keyboard Shortcuts** | Terminal-style shortcuts | ✅ |

### Commands
- `theme` - Show current theme
- `theme list` - List available themes
- `theme set <name>` - Set theme

### Available Themes
- `dark` (default)
- `light`
- `solarized-dark`
- `solarized-light`
- `monokai`
- `gruvbox`

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+L` | Clear screen |
| `Ctrl+U` | Clear input line |
| `Ctrl+K` | Clear to end of line |
| `Ctrl+A` | Go to line start |
| `Ctrl+E` | Go to line end |
| `↑/↓` | History navigation |

---

## 🧪 Test Coverage (v2.3.4)

**Total Tests:** 248

| Test Type | Files | Tests |
|-----------|-------|-------|
| Unit | 11 | 176 |
| Integration | 3 | 26 |
| E2E | 1 | 10 |
| Browser | 2 | 36 |

### Key Test Files
- `tests/unit/themes.test.js` - Theme system (15 tests)
- `tests/unit/pr.test.js` - PR operations (18 tests)
- `tests/integration/theme-command.test.js` - Command signature (7 tests)
- `tests/e2e/theme-command.test.js` - User flow simulation (10 tests)

---

## 🔍 Phase 10: Issues (v2.4.0) ✅

**Theme:** Full issue management

**Status:** Complete

### Features Implemented

| Feature | Description | Status |
|---------|-------------|--------|
| **List Issues** | View open/all issues | ✅ |
| **View Issue** | Detailed issue view | ✅ |
| **Create Issue** | Create with title/body | ✅ |
| **Close Issue** | Close issues | ✅ |
| **Comment** | Add comments to issues | ✅ |

### Commands
- `issues` - List open issues
- `issues --all` - List all issues
- `issues view <number>` - View issue details
- `issues create -t "title" -b "body"` - Create issue
- `issues close <number>` - Close issue
- `issues comment <number> "text"` - Add comment

---

## 🎨 Phase 8: UX Polish (v2.4.0) ✅

**Theme:** Better user experience

**Status:** Complete

### Features Implemented

| Feature | Description | Status |
|---------|-------------|--------|
| **Theme System** | 6 color themes | ✅ |
| **Keyboard Shortcuts** | Terminal-style shortcuts | ✅ |
| **Documentation** | User guide, command reference, API docs | ✅ |

### Available Themes
- `dark` (default)
- `light`
- `solarized-dark`
- `solarized-light`
- `monokai`
- `gruvbox`

### Documentation
- `docs/USER_GUIDE.md` - Complete user guide
- `docs/COMMANDS.md` - Full command reference
- `docs/API.md` - GitHub API integration details

---

## 🔮 Future Phases

### Phase 9: Pull Request Review
- `pr review <number>` - Review PR
- `pr comment <number>` - Add comment
- `pr approve <number>` - Approve PR

### Phase 10: Issues
- `issues` - List issues
- `issues create` - Create issue
- `issues close <number>` - Close issue

### Phase 11: Advanced Features
- `release` - Create releases
- `wiki` - View/edit wiki
- `actions` - View GitHub Actions

---

*Last updated: 2026-02-19*

### Technical Notes

- Requires auth (Phase 5)
- Use GitHub's Contents API for file operations
- Consider mini text editor (Monaco? CodeMirror? Or simple textarea)
- Git-like staging area concept (optional)

---

## 🔀 Phase 7: Pull Requests (v2.2)

**Theme:** Full PR workflow in terminal

### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **List PRs** | `pr` command to list pull requests | P0 |
| **View PR Details** | See diff, description, comments | P0 |
| **Create PR** | Turn current branch into PR | P1 |
| **Review PR** | Approve/request changes/comment | P2 |
| **Merge PR** | Merge via terminal | P1 |

### New Commands

```bash
pr [--open|--closed|--all]    # List PRs
pr view <number>              # View PR details
pr create --title "..."       # Create PR from current branch
pr diff <number>              # View PR diff
pr merge <number>             # Merge PR
pr close <number>             # Close PR
review <pr> --approve         # Approve PR
review <pr> --comment "..."   # Comment on PR
```

### UX Ideas

- `pr view` shows split-screen: description left, diff right
- Color-coded diff view (additions green, deletions red)
- Thread view for PR comments

---

## 🎨 Phase 8: UX & Polish (v2.3)

**Theme:** Professional terminal experience

### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Themes** | Multiple color schemes (light/dark/custom) | P0 |
| **Keyboard Shortcuts** | Vim/Emacs modes, custom bindings | P0 |
| **Command Aliases** | Define shortcuts for commands | P1 |
| **Improved Tab Completion** | Smarter autocomplete | P1 |
| **Command History Search** | Ctrl+R for history search | P0 |
| **Split Panes** | Multiple terminal panes | P2 |
| **Sessions** | Save/restore terminal sessions | P2 |

### New Commands

```bash
theme <name>            # Switch theme (dark, light, dracula, etc.)
alias ll="ls -la"       # Create command alias
bind <key> <action>     # Bind keyboard shortcut
sessions                # List saved sessions
session save <name>     # Save current session
session load <name>     # Restore session
```

### Technical Notes

- Store preferences in localStorage
- Consider xterm.js for better terminal emulation
- Themes as CSS variables for easy switching

---

## 🏢 Phase 9: Organizations & Teams (v2.4)

**Theme:** Navigate beyond personal repos

### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Org Navigation** | Browse organization repos | P0 |
| **Team Repos** | See repos by team membership | P1 |
| **Org Switcher** | Quick switch between orgs | P0 |

### New Commands

```bash
org                     # List your organizations
org <name>              # Navigate to org
teams                   # List teams in current org
team <name>             # Browse team repos
```

### Path Structure Update

```
/                           # Root
├── ~                       # Your repos (current)
├── @org1                   # Organization repos
│   ├── repo1/
│   └── repo2/
└── @org2/
    └── repo3/
```

---

## 🔔 Phase 10: Notifications & Actions (v2.5)

**Theme:** Stay informed

### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Notifications** | View GitHub notifications | P0 |
| **Actions** | View workflow runs | P0 |
| **Workflow Logs** | See CI/CD logs | P1 |
| **Badge Display** | Show CI status in `ls` | P2 |

### New Commands

```bash
notifications [--all]        # Show notifications
actions                      # List workflow runs
actions view <run-id>        # View run details & logs
actions rerun <run-id>       # Rerun workflow
```

### UX Ideas

- Notification count in prompt: `jerry@github-os:~ (3)`
- CI status badges next to repos in `ls`
- Real-time updates via polling (or WebSocket if available)

---

## 🚀 Phase 11: Power User Features (v3.0)

**Theme:** Advanced workflows

### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Shell Scripts** | Save & run command sequences | P0 |
| **File Watch** | Auto-refresh on file changes | P1 |
| **Gists** | Create/view gists | P1 |
| **Wiki** | Browse repo wikis | P2 |
| **Projects** | View GitHub Projects | P2 |
| **Discussions** | Browse discussions | P2 |
| **Webhooks** | View repo webhooks | P3 |
| **Deploy Keys** | Manage deploy keys | P3 |

### New Commands

```bash
script save <name>       # Save command history as script
script run <name>        # Execute saved script
gist create <file>       # Create gist from file
gist list                # List your gists
wiki                     # Browse repo wiki
projects                 # View GitHub Projects
discussions              # Browse discussions
```

---

## 🛠️ Technical Debt & Improvements

### Ongoing

- [ ] **Performance** - Optimize API calls, smarter caching
- [ ] **Accessibility** - Screen reader support, ARIA labels
- [ ] **Mobile UX** - Better touch keyboard, responsive layout
- [ ] **Offline Mode** - Cache visited repos for offline access
- [ ] **Error Recovery** - Better error messages, retry logic
- [ ] **Testing** - Increase test coverage to 80%+
- [ ] **Documentation** - Inline help, command examples

### Architecture Considerations

- **State Management** - Consider Zustand or similar for complex state
- **Terminal Library** - Evaluate xterm.js for better emulation
- **Build Step** - Consider Vite for bundling (optional, keep zero-build option)
- **Service Worker** - Enable offline + caching

---

## 📊 Version Summary

| Version | Theme | Key Features |
|---------|-------|--------------|
| v1.0-1.8 | Foundation | Core commands, read-only, tests |
| **v2.0** | Auth | OAuth, private repos, rate limits |
| **v2.1** | Write | Edit, commit, branch operations |
| **v2.2** | PRs | Full PR workflow |
| **v2.3** | Polish | Themes, shortcuts, UX |
| **v2.4** | Orgs | Organizations & teams |
| **v2.5** | Activity | Notifications, Actions |
| **v3.0** | Power | Scripts, gists, advanced features |

---

## 🤔 Open Questions

1. **Editor Choice** - Monaco (VS Code), CodeMirror, or simple textarea?
2. **Build Step** - Keep pure vanilla or add bundler for features?
3. **Mobile Strategy** - Full support or companion app?
4. **Enterprise** - Support GitHub Enterprise Server?
5. **PWA** - Make installable as desktop/mobile app?

---

## 💡 Crazy Ideas (Future)

- **Collaborative Terminal** - Share session with others (like tmux share)
- **AI Assistant** - "Ask GitHub Copilot" integration
- **Plugin System** - Let users write custom commands
- **Sound Effects** - Optional terminal sounds (key clicks, errors)
- **ASCII Art** - Generate ASCII art from repo structure
- **Gamification** - Achievements for exploring GitHub

---

*Last updated: 2026-02-17*
*Created by: openclaw*
