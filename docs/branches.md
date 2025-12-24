Branches
========

Branches are conditional overlays: when `artifact` processes an artifact it inspects `branches/<entry>/` and only applies the directories that match artifacts already present in the project (optionally filtered by variant). Use them for lightweight tweaks without cloning an entire package.

Quick Reference
---------------

- **Placement**: Put branch-specific files under `branches/[artifactName]` or `branches/[artifactName:variant]`.

- **Matching rule**: The part before the colon must match an installed artifact name. The optional `:variant` must match the variant resolved for that artifact (see [Variants](variants.md)).

- **Scope**: Branch content is merged after the base package (and its selected variant) so you can override or add files conditionally.

- **Logging**: Verbose runs print which branch directories matched, making it easy to confirm the overlay was applied.

Creating branch directories
---------------------------

Branch directories live under the top-level `branches/` folder of the package:

```
artifact-awesome/
├── .artifactrc.yml
└── branches/
    ├── [lang-js:14]/
    │   └── configs/
    │       └── .nvmrc    # node version for lang-js variant 14
    ├── [lang-js:20]/
    │   └── configs/
    │       └── .nvmrc    # node version for lang-js variant 20
    └── [lang-js]/
        └── configs/
            └── .editorconfig  # always apply when `lang-js` artifact exists
```

If the project has installed the `lang-js` artifact with the `14` variant, then the branches `[lang-js]` and `[lang-js:14]` are going to be applied.

Matching rules
--------------

1. `[artifactName]`: applies whenever `artifactName` is present in the install config, regardless of variant.
2. `[artifactName:variant]`: applies only when the project both installs `artifactName` and resolves the given variant.

You can mix both forms in the same package. The engine processes every matching directory, so you can layer a generic `[lang-js]` branch with a more specific `[lang-js:20]` branch.

Troubleshooting
---------------

If a branch isn't applied, check:
- The branch directory exists under `branches/` and uses the exact bracket syntax: `[artifactName]` or `[artifactName:variant]`.
- The `artifactName` matches one of the already installed artifacts in your project (uses `artifact list`).
- The branch directory is a directory (not a file) and contains the files you expect under its path (for example `configs/.nvmrc`).

Best practices
--------------

- Use branches for small, artifact-scoped overrides (like per-language config files) rather than duplicating entire packages.
- Name branch directories clearly: include the artifact name and a concise variant (e.g., `[lang-js:14]`) so the intent is obvious.
- Prefer placing only the files that differ in the branch directory; let common files remain in the artifact root.
- Cross-link your package README or documentation so consumers know which artifacts/variants activate each branch entry.
- Combine branches with variants to express rules like “apply this file when `lang-js` variant `20` is installed.”

Related docs
------------

- [Authoring artifacts](authoring-artifacts.md) for overall package layout.
- [Variants guide](variants.md)
- [Templating guide](templating.md)
- [`README.md`](../README.md) for CLI basics
