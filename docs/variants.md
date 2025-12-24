Variants
========

Variants let an artifact ship alternate sets of files (for example Node 14 vs Node 20, `stable` vs `next`) under `variants/<name>`.

When `artifact` installs or updates that package, it can automatically select a default variant or honor the variant requested by the project.

Quick Reference
---------------

- **Where files live**: put variant-specific files under `variants/<folder>/configs/` (or any folder structure you normally use inside a package).

- **Declare defaults**: set `variants.root` inside the package `.artifactrc*` file so the package can advertise a default variant when no explicit request is made.

- **Aliases**: Use entries under `variants` to map aliases

Declaring variants in a package
-------------------------------

Package-level variant config is read from the package's `.artifactrc` (or `.artifactrc.yml`, `.artifactrc.json`). This is what `readPackageConfig` consumes when the package is pulled in.

**Example: .artifactrc.yml**
```yaml
variants:
  # default root variant (applied when this package is installed)
  root: 14

  # optional mapping: request keys -> folder names under `variants/`
  # in this example a request for variant "14" will resolve to the folder "v14"
  14: v14
  20: v20
```

Directory layout for the package:

```
artifact-awesome/
├── .artifactrc.yml
├── variants/
│   ├── v14/
│   │   └── configs/
│   │       └── (files...)
│   └── v20/
│       └── configs/
│           └── (files...)
└── (other package files)
```

Root branch, `orphan`, and `extends`
------------------------------------

The package-level `variants.root` entry identifies the canonical branch that every other variant builds on. When a project asks for a variant, `artifact` installs the root branch first, then layers the requested variant on top unless the variant changes that behavior.

- **Root branch**: always install it and keep every shared file there. Omitting `variants.root` makes installs fail when variants refer back to the base branch.
- **`orphan`**: set `orphan: true` inside `variants/<name>/.artifactrc*` when the variant should stand on its own. `artifact` skips the root branch entirely, so only files from that variant are applied.
- **`extends`**: declare `extends: <variant>` inside a variant’s `.artifactrc*` to have it reuse another variant (often `root`, but any alias or folder name works). `artifact` resolves the referenced variant through the same alias map you defined under `variants` before falling back to the literal folder name, installs that base variant, and then returns to run the extending variant’s files.

**Example: variants/v20/.artifactrc.yml**
```yaml
# build v20 on top of the root branch
extends: root
```

**Example: variants/v24/.artifactrc.yml**
```yaml
# install v24 without inheriting from root
orphan: true
```

Troubleshooting checklist
-------------------------

1. Confirm the package actually ships a `.artifactrc*` file with `variants.root` defined.
3. Ensure the variant folder exists under `variants/` and contains the config files you expect.
5. Re-run with `--verbose` to inspect the `--> <name>@<version>:<variant>(<branch>)` log entries.

Related docs
------------

- [Authoring artifacts](authoring-artifacts.md) for overall package layout.
- [Branches guide](branches.md)
- [Templating guide](templating.md)
- [`README.md`](../README.md) for CLI basics
