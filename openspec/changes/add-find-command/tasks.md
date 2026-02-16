# Tasks: Add Find Command

## Implementation Checklist

- [ ] 1. Add `fetchRepoTree` function to `scripts/github.js`
  - Fetch recursive tree via Git Trees API
  - Handle caching like other API functions
  - Return array of file paths

- [ ] 2. Add `cmdFind` function to `scripts/commands.js`
  - Parse arguments and validate pattern
  - Check repository context
  - Call `fetchRepoTree` to get all files
  - Filter files by pattern (glob to regex)
  - Display results with count

- [ ] 3. Register `find` command in commands registry
  - Add to `commands` object
  - Add to help text
  - Add to tab completion list

- [ ] 4. Test locally
  - Start HTTP server
  - Test basic patterns
  - Test error cases
  - Test in different directories

- [ ] 5. Commit changes
