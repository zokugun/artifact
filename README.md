[@zokugun/artifact](https://github.com/zokugun/artifact)
========================================================

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@zokugun/artifact.svg?colorB=green)](https://www.npmjs.com/package/@zokugun/artifact)
[![License](https://img.shields.io/badge/donate-ko--fi-green)](https://ko-fi.com/daiyam)
[![License](https://img.shields.io/badge/donate-liberapay-green)](https://liberapay.com/daiyam/donate)
[![License](https://img.shields.io/badge/donate-paypal-green)](https://paypal.me/daiyam99)

`artifact` is a CLI for boilerplating your project by composing reusable config packages, merging overlapping files, and keeping every artifact in sync with a single update command.

Why artifact
------------

- Compose curated configuration packages ("artifacts") published on npm and mix several of them into a single repo.
- Merge overlapping files intelligently using the built-in routes/steps pipeline.
- Keep artifacts synchronized by running `artifact update`, optionally in CI with `--verbose` for traceability.
- Support variant-aware installs and branch overlays so packages can expose multiple flavors while staying DRY.

Mergeable Files
---------------

- `*.json` (JSON or JSONC)
- `*.yml`
- `*.yaml`
- `*ignore`
- `*rc` (YAML, JSON or JSONC)
- `*.config.ts`

Installation
------------

Choose the install mode that fits your workflow:

- **Global CLI** (recommended when you apply artifacts across many repos):

	```bash
	npm install -g @zokugun/artifact
	```

- **Project-local CLI** (handy for repo-specific automation):

	```bash
	npm install -D @zokugun/artifact
	npx artifact --help
	```

Artifact requires [Node.js](http://nodejs.org) 18+.

Quick Start
-----------

1. **Install the CLI** (globally or locally as shown in [Installation](#installation)).
2. **Add the artifacts you want to compose**:

	```bash
	artifact add @daiyam/lang-js @daiyam/lang-ts @daiyam/npm @daiyam/npm-ts
	```

	The command above installs the following packages:
	- [@daiyam/artifact-lang-js](https://github.com/daiyam/artifact-configs/tree/master/packages/lang-js)
	- [@daiyam/artifact-lang-ts](https://github.com/daiyam/artifact-configs/tree/master/packages/lang-ts)
	- [@daiyam/artifact-npm](https://github.com/daiyam/artifact-configs/tree/master/packages/npm)
	- [@daiyam/artifact-npm-ts](https://github.com/daiyam/artifact-configs/tree/master/packages/npm-ts)

3. **Inspect the git diff** created by the install. Keep overrides you like, discard unwanted changes, then rerun `artifact update` whenever upstream packages change.

Artifacts published to npm must be prefixed with `artifact-`.

Command Reference
-----------------

### `artifact add`

Registers and applies one or more artifacts in the current project.

- Syntax: `artifact add <artifact...> [options]`
- Useful flags: `-v, --verbose` to show detailed install output.
- Artifacts are stored in a `.artifactrc*` so subsequent updates know which packages to pull.

`<artifact>` can be `name` or `name:variant`.

### `artifact list` / `artifact l`

Shows the artifacts currently tracked in `.artifactrc*`, including versions and, when available, requested variants.

- Syntax: `artifact list`
- Alias: `artifact l`
- Output: prints each artifact as `name@version:variant`.

### `artifact update` / `artifact up`

Applies or refreshes the files provided by each installed artifact. Re-run it whenever upstream packages change.

- Syntax: `artifact update [options]`
- Alias: `artifact up`
- Advanced: pass `-v, --verbose` for an execution trace of routes, variants, and branches.
- Artifact authors can control how updates behave via `.artifactrc` files shipped inside their artifacts.

#### Best practices

Inspect the git diff after running to keep intentional overrides and drop unwanted changes.

Core Concepts
-------------

The next sections dive deeper into the primitives that make `artifact` powerful: templating, variants, and branch overlays.

Artifact Layout
---------------

The configuration/boilerplate files must be put inside the folder `configs`.

For example, the package [@daiyam/artifact-npm-cli-ts](https://github.com/daiyam/artifact-configs/tree/master/packages/npm-cli-ts):

```
npm-cli-ts/
  ├── configs/
  │  ├── bin/
  │  │  └── #[[package.json.name]]
  │  ├── bin/
  │  │  ├── command/
  │  │  │  └── hello.ts
  │  │  └── cli.ts
  │  ├── npmignore                  // => .npmignore
  │  ├── package.json
  ├── LICENSE
  ├── package.json
  └── README.md
```

Looking to build your own artifact? See [Authoring artifacts](docs/authoring-artifacts.md) for a step-by-step authoring guide.

Templating
----------

During installs and updates, `artifact` runs every text file (and file name) through a template engine.
Anywhere you place `#[[path/to/file.ext.property]]`, the engine:
- loads that JSON/YAML file from the target project,
- reads the property,
- and substitutes the value—perfect for wiring the target's `package.json.name`, license, or runtime settings into generated files.

You can also emit timestamps with helpers like `#[[date.utc]]`.

Read [docs/templating.md](docs/templating.md) for full syntax.

Variants
--------

Variants let an artifact expose multiple named flavors of its configuration (for example `14`, `20`, `stable`, `next`).
Consumers can request a variant in their install config, while package authors declare defaults and remap keys via `.artifactrc`.

See [docs/variants.md](docs/variants.md) for a full walkthrough, including examples of how to structure the `variants` folder.

Branches
--------

Branches are lightweight conditional overlays that live under `branches/[artifactName]` (or `[artifactName:variant]`).
They activate only when the matching artifact (and optional variant) is present, letting you ship targeted tweaks like per-language `.nvmrc` files without duplicating whole packages.

Learn more in [docs/branches.md](docs/branches.md), including matching rules and best practices for layering branches after variants.

More Documentation
------------------

- [Authoring artifacts](docs/authoring-artifacts.md)
- [Templating guide](docs/templating.md)
- [Variants guide](docs/variants.md)
- [Branches guide](docs/branches.md)

Donations
---------

Support this project by becoming a financial contributor.

<table>
	<tr>
		<td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_kofi.png" alt="Ko-fi" width="80px" height="80px"></td>
		<td><a href="https://ko-fi.com/daiyam" target="_blank">ko-fi.com/daiyam</a></td>
	</tr>
	<tr>
		<td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_liberapay.png" alt="Liberapay" width="80px" height="80px"></td>
		<td><a href="https://liberapay.com/daiyam/donate" target="_blank">liberapay.com/daiyam/donate</a></td>
	</tr>
	<tr>
		<td><img src="https://raw.githubusercontent.com/daiyam/assets/master/icons/256/funding_paypal.png" alt="PayPal" width="80px" height="80px"></td>
		<td><a href="https://paypal.me/daiyam99" target="_blank">paypal.me/daiyam99</a></td>
	</tr>
</table>

License
-------

Copyright &copy; 2021-present Baptiste Augrain

Licensed under the [MIT license](https://opensource.org/licenses/MIT).
