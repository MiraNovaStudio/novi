# Changelog — 2026-11-21 23:06

**Task:** Ad hoc — rebrand MiraNova Studios to MiraNova Studio  
**Commit:** TBD

## Summary

Updated live branding from **MiraNova Studios** to **MiraNova Studio** in source files, README, LICENSE, package author, and copyright header templates. Historical sprint notes and changelogs were left unchanged.

## Files changed

- Copyright headers in `src/` and `scripts/` (`MiraNova Studios` → `MiraNova Studio`)
- `src/renderer/components/App.ts` — About dialog copyright line
- `package.json` — `author` field
- `README.md` — intro attribution and footer
- `LICENSE` — copyright holder
- `scripts/add-copyright.js` — header template and check string
- `CLAUDE.md`, `AGENTS.md`, `nova/ai/CLAUDE_CONFIG.md`, `nova/ai/AGENTS.md` — required header example

## Rationale

Match the current studio name used on miranova.studio.

## Tests

`npm test` — 64 suites, 968 tests, all passed.
