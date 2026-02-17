# GitHub OS

A web-based terminal interface that mimics a VM file system, browsing GitHub repositories as directories and files.

![GitHub OS Demo](demo.gif)

## Features

- 🖥️ Terminal-like interface with authentic SSH vibes
- 🔐 **OAuth authentication** - Access private repos, 5000 req/hr
- 📁 Browse GitHub repositories as directories
- 📄 View file contents with syntax highlighting
- 🌳 Tree view for directory structures
- ⌨️ Command history (↑/↓ arrows)
- 🚀 Fully client-side, no backend needed
- 🎨 Dark theme with GitHub colors
- 📱 Responsive design

## Commands

### Navigation
| Command | Description |
|---------|-------------|
| `ls [path]` | List directory contents |
| `cd <path>` | Change directory |
| `pwd` | Print working directory |
| `tree [path]` | Display directory tree |
| `find <pattern>` | Find files by name pattern |

### File Operations
| Command | Description |
|---------|-------------|
| `cat <file>` | Display file contents |
| `head <file> [n]` | Display first n lines |
| `tail <file> [n]` | Display last n lines |
| `grep <pattern> [file]` | Search for pattern |
| `download <file>` | Download file |

### Repository
| Command | Description |
|---------|-------------|
| `info` | Show repository details |
| `log [count]` | Show commit history |
| `branch` | List all branches |
| `issues [--closed\|--all]` | List issues |
| `releases [count]` | List releases |
| `contributors [count]` | List contributors |
| `readme` | Display README.md |

### Authentication (NEW in v2.0)
| Command | Description |
|---------|-------------|
| `login` | Connect to GitHub with OAuth |
| `logout` | Disconnect from GitHub |
| `status` | Show auth status and rate limits |
| `whoami` | Show current GitHub user |
| `connect <user>` | Switch to different GitHub user |

### Other
| Command | Description |
|---------|-------------|
| `clear` | Clear terminal screen |
| `help` | Show available commands |
| `exit` | Exit terminal |

## Setup

### Quick Start (Anonymous)

1. Fork or clone this repository
2. Open `index.html` in a browser
3. Start browsing repos!

### With OAuth (Recommended)

To access private repos and get 5000 requests/hour:

1. **Create a GitHub OAuth App:**
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Set:
     - Application name: `GitHub OS`
     - Homepage URL: `https://<username>.github.io/github-os/`
     - Callback URL: `https://<username>.github.io/github-os/callback.html`

2. **Update Client ID:**
   Edit `scripts/auth.js` and replace the clientId:
   ```javascript
   const OAUTH_CONFIG = {
     clientId: 'YOUR_CLIENT_ID_HERE',
     // ...
   };
   ```

3. **Deploy and Login:**
   - Push to GitHub Pages
   - Run `login` command in the terminal

### Local Development

To change the default GitHub user, edit `scripts/config.js`:
```javascript
const DEFAULT_GITHUB_USER = 'your-username';
```

### Deploy to GitHub Pages

1. Push this code to the `main` branch
2. Go to Settings → Pages
3. Select "Deploy from a branch" → `main` → `/ (root)`
4. Your site will be live at `https://<username>.github.io/<repo-name>/`

## Technical Details

- **Pure vanilla JavaScript** - No build step, no dependencies
- **GitHub REST API** - With optional OAuth for higher rate limits
- **PKCE OAuth Flow** - Secure authentication without Client Secret
- **Syntax highlighting** - Powered by highlight.js
- **Session management** - localStorage-based with multi-account support
- **Responsive** - Works on desktop and mobile

## Rate Limits

| Mode | Rate Limit | Features |
|------|------------|----------|
| Anonymous | 60 requests/hour | Public repos only |
| Authenticated | 5000 requests/hour | Public + private repos |

## Limitations

- Large files may not load (GitHub API limit is 1MB for file contents)
- Binary files won't display properly
- Code search requires authentication

## Tips

- Use `cd ..` to go up one directory
- Use `cd /` to go back to root (repository list)
- Press `↑` and `↓` to navigate command history
- Use `tree` to get an overview of a repository structure

## License

MIT License - feel free to use and modify!

## Credits

Created by [awesomejerry](https://github.com/awesomejerry)
