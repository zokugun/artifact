# Changelog

## v0.11.0 | 2026-06-06
- rename routes (ex: `mapConcat` -> `map(concat)`)
- add combined routes (`map(sort, concat)`, `map(sort, compose)`)
- add preset routes (`default`, `default(sort)` and `package`)
- add new route `map(filter)`
- route can extending an existing route with `$$extend` and `patches` (json patch)
- route in a journey can be split into each lifecycles (`install`, `update` and `uninstall`)

## v0.10.0 | 2026-05-31
- add `self-upgrade` and `version` commands
- add `min-release-age` options
- reduce dependencies

## v0.9.0 | 2026-05-07
- add `journeys` and `routes` configs
- when a file is overwritten, any following artifact that isn't newer, will be executed for that file

## v0.8.0 | 2026-05-02
- add `outdated` command
- the `remove` command prompts for a selection if no artifact has been passed
- the `add` command prompts for a selection if `@<user>` is the only input of the command
- fix the `list` command

## v0.7.0 | 2026-04-24
- pass variables to the `add` command
- template expressions are supporting the pipe operator

## v0.6.3 | 2026-04-22
- limit file system traversing

## v0.6.2 | 2026-04-21
- expressions in `variables` need to be prefixed with `=`
- support non-expressions in `variables`
- ignore `constants`
- sort alphabetically `.commitlintrc` and `.fixpackrc` files

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
