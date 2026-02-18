## Why

GitHub OS 目前缺乏一個統一的 staging area 來管理檔案變更。用戶在進行檔案操作（create/update/delete）時，需要一個類似 Git staging area 的機制來暫存變更，以便在提交前進行審查和管理。

## What Changes

- 新增 `scripts/staging.js` 模組，提供 staging area 管理功能
- 實作 localStorage 結構來儲存 staged changes
- 提供完整的 CRUD 操作和驗證邏輯
- 支援衝突檢測（例如：不能同時 create 和 delete 同一個檔案）

## Capabilities

### New Capabilities

- `staging-area`: 管理 staging area 的核心功能，包括 create/update/delete 的暫存、查詢、清除和衝突檢測

### Modified Capabilities

None

## Impact

- 新增檔案：`scripts/staging.js`
- localStorage keys：`github_os_staging` (結構：`{ creates: {}, updates: {}, deletes: {} }`)
- 依賴現有的 `utils.js` 和 ES6 module 系統
