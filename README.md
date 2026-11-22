# Novi

**A Terminal Development Environment (TDE) built with Electron and TypeScript.**

Novi is a terminal-first editor: the shell is the primary workspace, and files, settings, and tools open as tabs around it. It is built for developers who live in the command line and want an editor that stays out of the way.

Built by [MiraNova Studio](https://miranova.studio).

---

## Status

**Active development** — v0.9.1

Supported platforms: **Linux** and **Windows**. macOS is not a current target.

Product page: [miranova.studio/projects/novi.html](https://miranova.studio/projects/novi.html)

---

## Philosophy

- **Terminal-first.** The terminal is the default workspace, not a panel bolted onto an editor.
- **CLI-driven.** A `novi` CLI talks to the running instance so you can open files and terminals from any shell.
- **No framework tax.** Vanilla TypeScript and direct DOM updates — no React, Vue, or Angular.
- **Local and private.** No telemetry, no accounts, no cloud lock-in.

---

## Features

- **Monaco editor** with TextMate grammar highlighting (VS Code–compatible extensions)
- **Integrated terminal** via node-pty and xterm.js
- **Vim mode** (optional, monaco-vim)
- **Git panel** — status, stage / unstage, commit, push, pull
- **File tree** with git status badges
- **SSH-aware tab titles** — remote `user@host` from an `ssh` session
- **Action HUD** (`Ctrl+K` or `Ctrl+Space`)
- **Customizable keyboard shortcuts**
- **CLI** — `novi file.py` opens the file in the running instance
- **Settings tab** — fonts, vim, keybindings, shell, and more
- **Image editor** for PNG, JPEG, GIF, WebP, and AVIF

---

## Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **npm** 9+
- **Git**
- **Windows:** [Windows Terminal](https://aka.ms/terminal) or Git Bash
- **Linux:** `libx11-dev`, `libxkbfile-dev`, `libsecret-1-dev` (native modules)

---

## Setup

```bash
git clone https://github.com/aeonath/novi.git
cd novi
npm install
npm start
```

`npm start` cleans `dist/`, compiles main and renderer, and launches Electron.

After the first build:

```bash
npm run start:fast
```

---

## Development

```bash
npm run build          # compile main + renderer
npm test               # Jest
npm run test:coverage  # coverage report
npm run lint           # ESLint
npm run lint:fix       # ESLint auto-fix
npm run fmt            # Prettier
```

Run a single test file:

```bash
npx jest src/tests/core-0.8.0/novi-command.test.ts
```

---

## Keyboard Shortcuts

Defaults on Windows and Linux. Remap them in **Settings → Keyboard Shortcuts**.

| Action | Shortcut | Notes |
|---|---|---|
| New File | `Ctrl+N` | |
| Open File | `Ctrl+O` | |
| Save | `Ctrl+S` | File tabs |
| Save As | `Ctrl+Shift+S` | File tabs |
| Close File | `Ctrl+W` | File tabs |
| Close Tab | `Ctrl+F4` | Any tab |
| New Terminal | `Ctrl+T` | |
| Open Settings | `Ctrl+,` | |
| Find | `Ctrl+F` | File tabs |
| Replace | `Ctrl+H` | File tabs |
| Undo / Redo | `Ctrl+Z` / `Ctrl+Y` | File tabs |
| Action HUD | `Ctrl+K` or `Ctrl+Space` | |
| Next / Previous Tab | `Ctrl+Tab` / `Ctrl+Shift+Tab` | |
| Full Screen | `F11` | |
| Refresh Git Status | `Ctrl+Shift+G` | |
| Developer Tools | `Ctrl+Shift+I` | |

Font size is **View → Increase / Decrease / Reset Font Size** (no default accelerator) and **Settings → Appearance**.

While a file is focused, **F1** opens Monaco’s own command palette. App-wide actions use the Action HUD.

---

## Settings

Open Settings with `Ctrl+,` or **Novi → Settings**.

| Setting | Default | Description |
|---|---|---|
| `fontSize` | `14` | Editor font size (px) |
| `terminalFontSize` | `14` | Terminal font size (px) |
| `editorFontFamily` | `DejaVu Sans Mono` | Editor typeface |
| `terminalFontFamily` | `DejaVu Sans Mono` | Terminal typeface |
| `terminalScrollback` | `25000` | Terminal scrollback lines |
| `editorTabSize` | `4` | Indent width |
| `editorInsertSpaces` | `true` | Insert spaces instead of tabs |
| `wordwrap` | `false` | Soft wrap in the editor |
| `vimode` | `false` | Enable vim keybindings |
| `preserveNoviKeybindingsInVim` | `false` | Keep Novi shortcuts in vim mode |
| `singlefiletree` | `false` | One shared file tree vs per-tab trees |
| `keeptabs` | `true` | Restore tabs across sessions |
| `gitenabled` | `true` | Git status in the file tree and Git panel |
| `showhiddenfiles` | `false` | Show dotfiles in the file tree |
| `linenumbers` | `true` | Editor line numbers |
| `columnbreak` | `false` | Target column marker |
| `keyboardShortcuts` | defaults | Per-action accelerator overrides |

Settings persist in the Electron user-data directory (`settings.json`).

---

## CLI

The `novi` CLI talks to a running instance over a named pipe on Windows (`\\.\pipe\novi-editor`) or a Unix socket on Linux (`~/.novi/novi-editor.sock`). If no instance is running, it starts one.

```bash
novi file.py           # open a file
novi -t                # new terminal in the current directory
novi                   # new untitled file (or restore the last session if none is running)
```

**Packaged install** (NSIS): the installer writes `novi` / `novi.cmd` next to `NoviEditor.exe` and adds that directory to the user PATH.

**From source:**

```bash
npm run novi -- file.py
```

On Windows you can also use `scripts/novi-dev.cmd`.

---

## Architecture

### Process model

```
Main Process (Node.js)              Renderer Process (Browser)
src/main/                           src/renderer/
  main.ts        ←── IPC ──────────→  components/App.ts
  menu.ts                             components/*.ts
  services/                           core/app-state.ts
  cli-mode.ts                         vim/
```

The renderer never calls Node or Electron APIs directly. All main-process access goes through `window.api`, exposed by `src/preload/preload.ts` via `contextBridge`.

### Build

Two-stage compilation:

1. **Main / preload / core** — `tsc -p tsconfig.json` → `dist/` (CommonJS). The renderer tree is excluded.
2. **Renderer** — `node scripts/build-renderer.js` (esbuild) bundles `src/renderer/index.ts` → `dist/renderer/index.js` (IIFE).

Static assets (HTML, images, Monaco workers, xterm.css) are copied afterward.

Renderer TypeScript imports local modules with `.js` extensions. esbuild resolves those to `.ts` at build time:

```ts
import { Component } from '../core/component.js';
```

### Components

Renderer UI is vanilla TypeScript classes extending `Component` (`src/renderer/core/component.ts`). Each component owns its DOM node, supports `mount` / `unmount` / `destroy`, and cleans up listeners via `listen()`. DOM creation uses `el()` from `src/renderer/core/dom.ts`.

### Tabs

Tab types: `'file' | 'image' | 'terminal' | 'settings'`. `App.ts` owns the tab list and routes rendering to `MonacoEditor`, `ImageEditor`, `Terminal`, or `SettingsTab`.

### File tree

Controlled by `singlefiletree`:

- `false` (default) — each terminal tab tracks its own CWD; file tabs keep the tree from when the file was opened
- `true` — one shared file tree for all tabs

### Main-process services

| Service | Role |
|---|---|
| `terminal-service.ts` | node-pty instances per terminal tab |
| `git-service.ts` / `git-watcher.ts` | Git operations and file-change watching |
| `git-status-worker.ts` | Isolated git-status work |
| `file-tree-watcher.ts` | Chokidar watcher for the file tree |
| `workspace-service.ts` | Persist open tabs and layout |
| `command-stats-service.ts` | Menu / Action HUD usage |
| `ssh-title-tracker.ts` | Remote-host titles from PTY output |
| `terminal-history-service.ts` | Terminal command history |
| `cli-service.ts` | Single-instance CLI socket / named pipe |

### Extensions

`src/core/extension-loader.ts` loads TextMate grammar extensions from `~/.novi/extensions/`. Only extensions whose `activationEvents` are limited to `onLanguage:*` are loaded.

---

## Project Structure

```
novi/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts
│   │   ├── menu.ts
│   │   ├── cli-mode.ts
│   │   └── services/
│   ├── preload/              # contextBridge (window.api)
│   ├── renderer/             # UI (vanilla TS)
│   │   ├── components/
│   │   ├── core/
│   │   ├── services/
│   │   └── vim/
│   ├── core/                 # Shared: shortcuts, extensions, path utils
│   ├── tests/                # Jest (core-0.1.0 … core-0.8.0)
│   │   └── mocks/            # monaco-editor mock
│   └── types/
├── scripts/
│   ├── build-renderer.js
│   ├── after-pack.js
│   └── packaging/            # electron-builder resources (NSIS, icons)
├── nova/                     # Sprint notes, agent config (legacy path name)
├── package.json
└── README.md
```

---

## Testing

Jest + ts-jest, jsdom environment. Suites live under `src/tests/core-0.x.0/` (one directory per sprint). Monaco is mocked at `src/tests/mocks/monaco-editor.ts`.

```bash
npm test
npm run test:coverage
```

---

## Packaging

```bash
npm run pack:win              # portable Windows EXE
npm run pack:win:installer    # Windows NSIS installer (adds `novi` to PATH)
npm run pack:deb              # Linux .deb
```

electron-builder reads the `build` field in `package.json`. Installer resources live in `scripts/packaging/`. Output goes to `release/`.

---

## Logging

Main-process logs are written to date-stamped files under the Electron user-data directory:

- Windows: `%APPDATA%\NoviEditor\logs\`
- Linux: `~/.config/NoviEditor/logs/`

---

## Contributing

1. Fork the repository.
2. Create a feature branch from `main`.
3. Keep the change focused. Match existing TypeScript style (vanilla classes, `el()` for DOM, `.js` import specifiers in the renderer).
4. New `.ts` / `.js` source files start with:

   ```ts
   /**
    * © 2025-2026 MiraNova Studio. All rights reserved.
    */
   ```

5. Add tests under `src/tests/` for the current yield version. Do not relocate older sprint tests.
6. Run `npm test` and `npm run lint` before opening a pull request.

Please open an issue or [contact MiraNova Studio](https://miranova.studio/contact.html) before large architectural changes.

---

## License

[MIT](./LICENSE) © 2025-2026 MiraNova Studio

---

## Support

- **Product page:** [miranova.studio/projects/novi.html](https://miranova.studio/projects/novi.html)
- **Contact:** [miranova.studio/contact.html](https://miranova.studio/contact.html)
- **Source:** [github.com/aeonath/novi](https://github.com/aeonath/novi)

---

Built by **MiraNova Studio**
