# Copilot instructions (myapp / eLibrary)

## Big picture

- This is an Electron app built with `electron-vite`:
  - Main process: `src/main/index.js`
  - Preload bridge: `src/preload/index.js`
  - Renderer (React): `src/renderer/src` (entry: `src/renderer/src/main.jsx`)
- Renderer uses React Router + Redux Toolkit + redux-persist (store: `src/renderer/src/app/store.js`).
- Backend calls are done with Axios in `src/renderer/src/Features/api.js` using a hard-coded `API_URL` and Bearer auth headers.

## IPC / security model

- `contextIsolation` is enabled and `nodeIntegration` is disabled in the BrowserWindow (`src/main/index.js`).
- Preload exposes a narrow API on `window.api` via `contextBridge` (`src/preload/index.js`).
  - Only send channels currently allowed: `save-pdf`, `ping`.
  - Only receive channels currently allowed: `update-status`, `update-progress`.
- When adding new IPC:
  - Add a whitelisted channel in `src/preload/index.js`.
  - Add the matching `ipcMain.on/handle` in `src/main/index.js` (or a dedicated main module).

## Build + packaging

- Dev: `npm run dev` (electron-vite).
- Production bundles: `npm run build` (outputs into `out/**`).
- Windows installer: `npm run build:win` (uses `electron-builder.yml`).
- Packaging config is in `electron-builder.yml` (preferred) and also partially duplicated in `package.json#build`.
  - App/installer icon source: `build/icon.ico`.
  - Main window icon at runtime is set in `src/main/index.js` and expects `icon.ico` to be present under `process.resourcesPath` when packaged.

## App behavior conventions

- Auth state:
  - Token is stored in `localStorage` as `authToken` (see `src/renderer/src/Features/authService.js`).
  - Redux auth slice is `src/renderer/src/Features/authSlice.js` and persisted via redux-persist.
- Session timeout:
  - `src/renderer/src/main.jsx` logs the user out after 15 minutes of inactivity by dispatching `logout()` and navigating to `/`.
- Theme:
  - Renderer forces light mode in `src/renderer/src/main.jsx` (removes `dark`, sets `data-theme=light`).

## Project-specific patterns

- Renderer import alias: `@` maps to `src/renderer/src` (see `electron.vite.config.mjs`).
- Network/CSP:
  - `src/main/index.js` sets a strict-ish CSP in `onHeadersReceived` and explicitly lists allowed API hosts.

## When changing APIs

- Keep `getAuthHeaders(token)` usage consistent (Bearer token) as used throughout `src/renderer/src/Features/api.js`.
- Prefer adding new API helpers alongside existing ones in `src/renderer/src/Features/api.js` and calling them from feature components/slices.
