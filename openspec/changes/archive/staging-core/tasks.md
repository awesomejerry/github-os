## 1. Module Setup

- [x] 1.1 Create `scripts/staging.js` file with ES6 module structure
- [x] 1.2 Define localStorage key constant `GITHUB_OS_STAGING_KEY`
- [x] 1.3 Implement helper function `getStagingData()` to read from localStorage with error handling
- [x] 1.4 Implement helper function `saveStagingData(data)` to write to localStorage

## 2. Core Functions

- [x] 2.1 Implement `stageCreate(path, content)` with conflict detection
- [x] 2.2 Implement `stageUpdate(path, content, sha)` with validation and conflict detection
- [x] 2.3 Implement `stageDelete(path, sha)` with validation and create-removal logic
- [x] 2.4 Implement `getStagedChanges()` to return all staged changes
- [x] 2.5 Implement `clearStaging()` to reset staging area
- [x] 2.6 Implement `isStaged(path)` to check if path is in any category

## 3. Error Handling

- [x] 3.1 Add error handling for localStorage unavailability
- [x] 3.2 Add error handling for JSON parse errors (return empty object)
- [x] 3.3 Add clear error messages for all validation failures
- [x] 3.4 Add error handling for localStorage quota exceeded

## 4. Export

- [x] 4.1 Export all public functions: stageCreate, stageUpdate, stageDelete, getStagedChanges, clearStaging, isStaged
