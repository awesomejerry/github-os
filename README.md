# GitHub OS

<div align="center">
  
  **Make GitHub feel like home.**
  
  [![Version](https://img.shields.io/badge/version-v2.4.2-blue.svg)](https://www.awesomejerry.space/github-os/)
  [![Tests](https://img.shields.io/badge/tests-285%20passed-brightgreen.svg)](#)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![Sponsor](https://img.shields.io/badge/💜-Sponsor-ff69b4.svg)](https://github.com/sponsors/awesomejerry)
  
  [Live Demo](https://www.awesomejerry.space/github-os/) • [Documentation](docs/USER_GUIDE.md) • [Commands](docs/COMMANDS.md)
  
  <img src="https://via.placeholder.com/800x400?text=GitHub+OS+Screenshot" alt="GitHub OS Screenshot" width="100%">
  
</div>

---

## What is GitHub OS?

GitHub OS is a browser-based terminal interface that makes interacting with GitHub feel like using a native operating system. Navigate repos, edit files, manage issues and PRs - all through a familiar command-line interface.

```bash
awesomejerry@github-os:~/my-repo$ ls
src/  tests/  README.md  package.json

awesomejerry@github-os:~/my-repo$ edit README.md
# Opens built-in editor...

awesomejerry@github-os:~/my-repo$ commit -m "Update README"
✓ Committed 1 change
```

---

## ✨ Features

### 🗺️ Navigation
- `ls`, `cd`, `pwd`, `tree` - Navigate repositories like a filesystem
- `cat`, `head`, `tail` - View file contents
- `find`, `grep` - Search files and content

### ✏️ File Operations
- `touch`, `mkdir`, `rm`, `mv`, `cp` - Create, delete, move files
- `edit` - Built-in modal editor with syntax highlighting
- **Staging workflow** - Stage changes before batch commit

### 🔀 Git Operations
- `branch`, `checkout` - Manage branches
- `commit` - Batch commit staged changes
- `log` - View commit history

### 🔀 Pull Requests
- `pr` - List pull requests
- `pr view` - View PR details
- `pr create` - Create new PR
- `pr merge` / `pr close` - Merge or close PRs

### 📋 Issues
- `issues` - List and manage issues
- `issues create` - Create issues
- `issues close` - Close issues
- `issues comment` - Add comments

### 🎨 Themes
- 6 built-in themes (dark, light, solarized, monokai, gruvbox)
- `theme set <name>` - Switch themes instantly

### 🔐 Authentication
- GitHub OAuth with PKCE
- Access private repositories
- 5000 requests/hour (vs 60 unauthenticated)

---

## 🚀 Quick Start

1. **Open the app:** [awesomejerry.space/github-os](https://www.awesomejerry.space/github-os/)

2. **Connect to a user:**
   ```bash
   connect awesomejerry
   ```

3. **Navigate to a repo:**
   ```bash
   cd github-os
   ls
   ```

4. **Login to make changes:**
   ```bash
   login
   ```

5. **Start editing:**
   ```bash
   edit README.md
   # Ctrl+S to save (stages changes)
   commit -m "Update README"
   ```

---

## 📚 Documentation

- **[User Guide](docs/USER_GUIDE.md)** - Complete usage guide
- **[Command Reference](docs/COMMANDS.md)** - All commands documented
- **[API Reference](docs/API.md)** - GitHub API integration

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+L` | Clear screen |
| `Ctrl+U` | Clear line |
| `Ctrl+S` | Save (in editor) |
| `Tab` | Auto-complete |
| `↑/↓` | History |

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), CSS3
- **Auth:** GitHub OAuth PKCE
- **API:** GitHub REST API v3
- **Backend:** Cloudflare Workers (token exchange)
- **Testing:** Vitest (285 tests)

---

## 📊 Stats

- **Version:** v2.4.2
- **Commands:** 40+
- **Tests:** 285 passing
- **Themes:** 6
- **Specs:** 24 (BDD format)

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

---

## 💜 Support This Project

If GitHub OS helps you be more productive, consider supporting its development:

**[🎁 Become a Sponsor](https://github.com/sponsors/awesomejerry)**

Sponsors get:
- 🌟 Recognition in README
- 🚀 Early access to new features
- 💬 Priority support
- 🎨 Custom theme requests

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- GitHub API team for the excellent API
- Everyone who provided feedback and suggestions
- Our sponsors for making development possible

---

<div align="center">
  
  Made with 💜 by [AwesomeJerry](https://github.com/awesomejerry)
  
  [⬆ Back to Top](#github-os)
  
</div>
