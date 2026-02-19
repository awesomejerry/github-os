# Theme System Spec

## Overview

Color theme system for the terminal UI.

## Requirements

### 1. Available Themes
- dark (default)
- light
- solarized-dark
- solarized-light
- monokai
- gruvbox

### 2. Theme Structure
```javascript
{
  name: string,
  label: string
}
```

### 3. Operations
- `getCurrentTheme()` - Get current theme name
- `setTheme(name)` - Set theme by name
- `listThemes()` - List all available themes
- `loadSavedTheme()` - Load from localStorage

### 4. Persistence
- Save to localStorage (key: github_os_theme)
- Load on app init

### 5. DOM Integration
- Add/remove class on documentElement
- Class format: theme-{name}
- CSS custom properties for colors

### 6. Command
```bash
theme              # Show current theme
theme list         # List all themes
theme set <name>   # Set theme
```

### 7. Command Signature
```javascript
function cmdTheme(terminal, githubUser, args)
```

## Files

- `scripts/themes.js` - Theme management
- `scripts/commands.js` - cmdTheme command
- `styles/themes/*.css` - Theme stylesheets

## Status

✅ Implemented in v2.3.0
✅ Bug fixed in v2.3.2 (command signature)
