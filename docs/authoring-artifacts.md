Authoring Artifacts
===================

This document walks through creating and publishing an "artifact" package so teams can reuse the same project scaffolding everywhere. Keep it handy when bootstrapping a new package or reviewing an existing one.

Naming conventions
------------------

- **Prefix requirement**: Every published package must start with `artifact-`.<br />
Scoped packages should still add the prefix (e.g., `@your-org/artifact-node-lib`).<br />
This keeps discovery consistent and avoids collisions with non-artifact packages.

- **Short descriptors**:  After the prefix, describe the domain succinctly (`lang-js`, `npm-cli`, `vscode-extension`).<br />
Use hyphens to separate broad areas from more specific ones.

- **Variant clarity**: If you ship variants for major tool versions, keep the base name stable and let variants capture the drift (for example, `@scope/artifact-lang-js` with variants `14` and `20`).

Project layout (no variant)
-------------------------------

Use this structure when your artifact ships without variants:

```
artifact-awesome/
  ├── package.json
  ├── README.md
  ├── .artifactrc.yml          # package-level config read by artifact
  ├── configs/                 # base files copied/merged into projects
  │  ├── package.json
  │  ├── .editorconfig
  │  └── ...
  └── branches/                # optional; overlays targeting installed artifacts
     └── [lang-js]/
        └── configs/.nvmrc
```

- The `configs/` tree runs through the merge pipeline once per install/update.
- Branches let you add optional files that only apply when specific artifacts (and variants) are present downstream. See [Branches](branches.md).

Project layout (multiple variants)
----------------------------------

When you need different flavors (for example Node 14 vs Node 20), move the configs into `variants/<name>/configs/` and drop the top-level `configs/` folder entirely:

```
artifact-awesome/
  ├── package.json
  ├── README.md
  ├── .artifactrc.yml
  └── variants/
    ├── v14/
    │  ├── configs/
    │  │  └── ...
    │  └── branches/                # optional
    │     └── [lang-js]
    └── v20/
      ├── configs/
      │  └── ...
      └── branches/                 # optional
        └── [lang-js:20]
```

- Each variant folder mirrors the single-variant `configs/` layout and owns its optional `branches/` directory.
- Declare `variants.root` plus optional key mappings in `.artifactrc`. Consumers request variants via `requires.variant`; see the [Variants guide](variants.md).

### General rules

- Use either `configs/` **or** `variants/` at the root—never both.
- Keep shared files in `configs/` (single variant) or copy them in the **root** variant.
- In multi-variant packages, place branch overlays inside each variant folder (no global `branches/`).

`.artifactrc` essentials
------------------------

`.artifactrc` (YAML or JSON) is where you describe how files move from the artifact into the target repo.

### `install` / `update`

#### Examples

- **Force rewrite for `tsconfig.json`**

```yaml
install:
  tsconfig.base.json:
    remove: true
  tsconfig.json:
    overwrite: true
```

Deletes any existing `tsconfig.base.json` in the target project, and, overwrites `tsconfig.json` (no merge).

- **Seed-once artifacts**

```yaml
update:
  '*':
    update: false
```

or simply

```yaml
update: false
```

Disables updates globally — handy when the artifact only bootstraps files once and teams own future edits.

- **Partial `package.json` updates**

```yaml
update:
  package.json:
    filter:
      - scripts
      - devDependencies
```

Limits updates in `package.json` to the `scripts` and `devDependencies` keys so other sections stay untouched.

- **Custom merge route**

```yaml
update:
  .xo-config.json:
    route:
      json:
        compose:
          ignores: listConcat
          overrides: listConcat
          plugins: listConcat
          rules: [mapConcat, mapSort]
          $$default: overwrite
```

Applies the custom merge route for `.xo-config.json`

- **Opt-out for specific files**

```yaml
update:
  src/index.ts:
    missing: false
    update: false
```

Leaves `src/index.ts` alone after the first install; `artifact update` will neither recreate nor edit it even if the artifact changes.

####

`install` or `update` properties are working the same way:
- each key under them points to a source file or glob inside the artifact.
- the value describes how `artifact` copies/merges that file into the target project.

But:
- `install` determines how files are applied when the artifact is added (`artifact add`)
- `update` determines how files are merged when the artifact is updated (`artifact update`)

| Action      | Description                                     | `install` | `update` |
| ----------- | ----------------------------------------------- | :-------: | :------: |
| `filter`    | determines which properties are merged together |    ✅     |    ✅    |
| `missing`   | should missing files be recreated               |    ❌     |    ✅    |
| `overwrite` | should the file be write as it is               |    ✅     |    ❌    |
| `remove`    | delete the file                                 |    ✅     |    ❌    |
| `route`     | define how the file will be merged              |    ✅     |    ✅    |
| `update`    | should the file be updated                      |    ❌     |    ✅    |

### `variants`

`variants` is a map of aliases for different folders under `variants/<name>`:

- `root`: **required**. This is the default variant, root of others variants.
- `<alias>: <name>` entries: each alias maps to a folder name that exists under `variants/`.

Read the [Variants guide](variants.md) for for more info.

Templating
----------

Before files are written, `artifact` runs them through a template engine that replaces `#[[path/to/file.ext.property]]` placeholders with values read from JSON/YAML files in the target project.<br/>
Use this to inject the project's `package.json.name`, `.editorconfig` defaults, or even timestamps via `#[[date.utc]]`. When authoring artifacts:

Both filenames and file contents are templated, so you can name executables dynamically (`bin/#[[package.json.name]]`).

For advanced syntax, see [Templating guide](templating.md).

#### Example (inside `README.md` in the artifact):

```
# Project #[[package.json.name]]

This project targets Node #[[package.json.engines.node]] and ships under the #[[package.json.license]] license.

Generated on #[[date.utc]]
```

Testing locally
---------------

1. In a sample project, run `artifact add ./path/to/artifact-awesome -v` to confirm files land correctly.
2. Use `artifact list` to verify the artifact name, version, and variant metadata look right.
3. Run `artifact update -v` to make sure subsequent updates respect your `.artifactrc` rules (filters, routes, overwrite flags, etc.).
4. Inspect the git diff after each run; you should see only the files you intended to manage changing.

Useful references
-----------------

- [Variants guide](variants.md)
- [Branches guide](branches.md)
- [Templating guide](templating.md)
- [`README.md`](../README.md) for CLI basics
