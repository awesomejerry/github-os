# Proposal: Add Find Command

## Problem
Users cannot search for files by name pattern across the repository. They must manually navigate directories with `ls` and `cd` to locate files, which is inefficient for large repositories.

## Solution
Add a `find` command that searches for files matching a pattern across the entire repository tree.

## Value
- Faster file discovery
- Familiar Unix-like command experience
- Essential for navigating large codebases

## Examples
```
find *.js        → List all JavaScript files
find test        → List all files containing "test"
find README      → List all README files
find src/utils   → List files matching "src/utils" pattern
```

## Dependencies
- GitHub Git Trees API (recursive file listing)
- Existing repository context from terminal state
