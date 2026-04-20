# Changelog

## v0.6.1 | 2026-04-20
- fix the order of the actions
- improve formatting

## v0.6.0 | 2026-04-16
- add `uninstall` command
- add `always` and `upsert` lifecycles
- add `remove`, `rename` and `unmerge` actions
- add `transforms` actions using `jq` expressions
- add schema and validate version
- replace boolean options with `if_exists` and `if_missing` options
- allow `update: true` to override previous exclusion
- normalize options
- improve merging commands
- remove `npm` dependency
- detect indentation

## v0.5.2 | 2025-04-09
- improve merging commands

## v0.5.1 | 2025-04-09
- improve merging commands

## v0.5.0 | 2025-04-08
- add variables

## v0.4.4 | 2026-04-07
- add `overwrite` action

## v0.4.3 | 2025-12-24
- improve log formatting

## v0.4.2 | 2025-12-24
- add dry-run flag
- improve logs
- add the `artifact` prefix when matching branches

## v0.4.1 | 2025-12-24
- update dependencies

## v0.4.0 | 2025-12-24
- add variants and branches
- merge `*.config.ts` files

## v0.3.1 | 2025-03-13
- apply templates when updating

## v0.3.0 | 2025-02-18
- add template

## v0.2.5 | 2022-04-15
- improve merging commands

## v0.2.4 | 2022-03-16
- revert `ora` dependency

## v0.2.3 | 2022-03-16
- revert `tempy` dependency

## v0.2.2 | 2022-03-16
- revert `npm` dependency

## v0.2.1 | 2022-03-16
- update dependencies

## v0.2.0 | 2021-09-30
- add `update` command
- add progress indicators
- support `fixpack` with sorted array
- merge correctly `.nvmrc` files
- improve JSONC formatting
- improve command lines merging

## v0.1.0 | 2021-09-18
- initial release
