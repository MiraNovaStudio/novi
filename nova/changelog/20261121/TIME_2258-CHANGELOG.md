# Changelog — 2026-11-21 22:58

**Task:** Ad hoc — move Novi docs into the MiraNova Studio docs tree  
**Commit:** TBD

## Summary

Moved the project documentation out of this repository into `../miranova.studio/docs/projects/novi/`, matching how other studio projects (atlas, polaris, xpl) are stored. Removed the old `docs/` and `nova/docs/` directories from this repo.

## Files changed

### Removed (moved to `../miranova.studio/docs/projects/novi/`)

- `docs/NAS_CHANGELOG_SPEC.md`
- `docs/NAS_TEST_STRUCTURE.md`
- `docs/NAS_TRAJECTORIES.md`
- `docs/NOVA_AGILE_SPECIFICATION_2.md`
- `docs/NOVA_BRINGUP_PLAN.md`
- `docs/NOVA_EDITOR.md`
- `docs/NOVA_VISION.md`
- `docs/PACKAGING_VERIFICATION.md`
- `docs/devil_commit.txt`
- `nova/docs/TERMINAL_LIMITATIONS.md`

### Added

- `nova/changelog/20261121/TIME_2258-CHANGELOG.md` — this file

## Rationale

Keep Novi source in this repo and park product/process docs with the rest of MiraNova Studio documentation.

## Tests

Not run. Documentation move only; no source or test changes.
