## Context

GitHub OS Terminal needs a theme system for visual customization. Currently there are no theme capabilities. The system uses CSS classes on the document root for theme switching.

## Goals / Non-Goals

**Goals:**
- Implement 6 preset themes (dark, light, solarized-dark, solarized-light, monokai, gruvbox)
- Theme command: display, list, set
- Persist theme choice in localStorage
- Theme switching via CSS class changes

**Non-Goals:**
- Custom theme creation by users
- Theme import/export
- Per-repository themes

## Decisions

1. **CSS Class-based Theming**: Use CSS classes on `<html>` element (e.g., `class="theme-dark"`) rather than CSS variables swap. Simpler implementation, better browser support.

2. **localStorage Key**: `github_os_theme` storing `{ name: "dark" }`. JSON format allows future expansion.

3. **Default Theme**: "dark" - matches developer preference and reduces eye strain.

4. **Theme File Structure**: One CSS file per theme in `styles/themes/<name>.css` for maintainability.

## Risks / Trade-offs

- **Flash of unstyled content** → Load theme CSS early in `<head>`, apply saved theme before render
- **Invalid theme in localStorage** → Fall back to "dark" default
