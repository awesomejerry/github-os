## Why

Users need visual customization to match their preferences and reduce eye strain. A theme system allows switching between dark, light, and popular color schemes like Solarized, Monokai, and Gruvbox.

## What Changes

- Add `theme` command to display, list, and set themes
- Add theme CSS files for 6 preset themes (dark, light, solarized-dark, solarized-light, monokai, gruvbox)
- Implement theme persistence via localStorage
- Theme switching via CSS class changes on document root

## Capabilities

### New Capabilities
- `theme-system`: Theme management including display current theme, list available themes, and set theme with localStorage persistence

### Modified Capabilities
- `commands`: Add `theme`, `theme list`, and `theme set <name>` commands

## Impact

- New file: `scripts/themes.js` - Theme management module
- New files: `styles/themes/*.css` - Individual theme stylesheets
- Modified: `scripts/commands.js` - Add cmdTheme function
- Modified: `index.html` - Load theme CSS files
- localStorage key: `github_os_theme` stores `{ name: "dark" }`
