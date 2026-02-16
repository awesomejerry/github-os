# Spec: Find Command

## Command Signature
```
find <pattern>
```

## Behavior
Searches for files matching the given pattern across the entire repository.

## Parameters
| Parameter | Required | Description |
|-----------|----------|-------------|
| pattern   | Yes      | File name or glob pattern to search for |

## Pattern Syntax
- Literal text matches anywhere in path
- `*` matches any sequence of characters
- `?` matches any single character
- Pattern is case-insensitive by default

## Output
- Each matching file path on a new line
- Paths relative to repository root
- Total count of matches at the end

## Errors
| Condition | Message |
|-----------|---------|
| No pattern provided | "Usage: find <pattern>" |
| Not in repository | "Not in a repository. Use 'cd' to enter a repo first." |
| No matches | "No files found matching '{pattern}'" |
| API error | "Error: {message}" |

## Examples

### Find all JavaScript files
```
$ find *.js
scripts/app.js
scripts/commands.js
scripts/github.js
scripts/utils.js
4 file(s) found
```

### Find files containing "test"
```
$ find test
tests/app.test.js
tests/utils.test.js
src/test-helpers.js
3 file(s) found
```

### Find specific file
```
$ find README
README.md
docs/README.md
2 file(s) found
```
