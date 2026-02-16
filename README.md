# GitHub OS

A web-based terminal interface that mimics a VM file system, browsing GitHub repositories as directories and files.

![GitHub OS Demo](demo.gif)

## Features

- 🖥️ Terminal-like interface with authentic SSH vibes
- 📁 Browse GitHub repositories as directories
- 📄 View file contents with syntax highlighting
- 🌳 Tree view for directory structures
- ⌨️ Command history (↑/↓ arrows)
- 🚀 Fully client-side, no backend needed
- 🎨 Dark theme with GitHub colors
- 📱 Responsive design

## Commands

| Command | Description |
|---------|-------------|
| `ls [path]` | List directory contents |
| `cd <path>` | Change directory |
| `pwd` | Print working directory |
| `cat <file>` | Display file contents |
| `tree [path]` | Display directory tree |
| `grep <pattern> <file>` | Search in a file |
| `log [count]` | Show recent commits (default: 10) |
| `branch` | List all branches (default marked with *) |
| `find <pattern>` | Find files by name pattern |
| `issues [--closed\|--all]` | List repository issues (default: open) |
| `clear` | Clear terminal screen |
| `help` | Show available commands |
| `exit` | Exit terminal |

## Usage

### For Yourself

1. Fork or clone this repository
2. Open `index.html` in a browser
3. Start browsing your repos!

### For Others

**No configuration needed!** Just:
1. Fork this repository
2. Enable GitHub Pages
3. It automatically detects your username from the URL

**How it works:** When hosted on `https://<username>.github.io/`, it automatically extracts `<username>` and shows your repos. On localhost or other domains, it falls back to the default user.

To change the default user for local development, edit line 48 in `index.html`:
```javascript
const DEFAULT_GITHUB_USER = 'awesomejerryshen';
```

### Deploy to GitHub Pages

1. Create a new GitHub repository
2. Push this code to the `main` branch
3. Go to Settings → Pages
4. Select "Deploy from a branch" → `main` → `/ (root)`
5. Your site will be live at `https://<username>.github.io/<repo-name>/`

## Technical Details

- **Pure vanilla JavaScript** - No build step, no dependencies
- **GitHub REST API** - Uses public API (no authentication needed)
- **Syntax highlighting** - Powered by highlight.js
- **Monospace fonts** - SF Mono, Monaco, Fira Code, and fallbacks
- **Responsive** - Works on desktop and mobile

## Limitations

- Only shows **public repositories**
- GitHub API has a rate limit of 60 requests/hour for unauthenticated requests
- Large files may not load (GitHub API limit is 1MB for file contents)
- Binary files won't display properly

## Tips

- Use `cd ..` to go up one directory
- Use `cd /` to go back to root (repository list)
- Press `↑` and `↓` to navigate command history
- Use `tree` to get an overview of a repository structure

## License

MIT License - feel free to use and modify!

## Credits

Created by [awesomejerry](https://github.com/awesomejerry)
