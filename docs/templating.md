Templating
==========

`artifact` runs a templating pass after it reads incoming files and before they are written to disk. This pass lets you substitute values from the target project (for example the project's `package.json`) or inject timestamps without writing custom scripts.

Both filenames and file contents are templated, so you can name executables dynamically (`bin/#[[package.json.name]]`).

When templating runs
--------------------

The `replace-templates` step processes every text file's contents and name, plus every binary file's target path. It uses the project's root as the lookup directory when loading data for placeholders.

Placeholder syntax
------------------

Use `#[[path/to/file.ext.property.path]]` inside any file name or file contents. During processing the engine will:

1. Resolve the file path relative to the project root. Extensions supported out of the box: `.json`, `.yaml`, `.yml` (other extensions attempt JSON first, then YAML).
2. Parse the file once and cache the result for the remainder of the run.
3. Traverse the dotted property path and substitute the value.

Example (in an artifact's `configs/README.md`):

```
Project: #[[package.json.name]]
Version: #[[package.json.version]]
Default entry: #[[package.json.main]]
```

If any path fails to resolve (missing file, invalid JSON/YAML, or missing property) the run throws a `TemplateError` that shows the offending placeholder. This keeps templates deterministic and surfaces typos immediately.

Date helper
-----------

You can request the current UTC timestamp using the special `date` placeholder:

- `#[[date.utc]]` → `YYYY-MM-DD HH:mm:ss` in UTC.
- `#[[date.YYYY]]` (or any valid [dayjs](https://day.js.org/docs/en/display/format) format) → formatted string using UTC time.

Best practices
--------------

- Keep placeholder file paths relative (e.g., `package.json`), not absolute.
- Prefer referencing files that already exist in the target project so repeated runs stay consistent.
- Group template-driven values near the top of your files so errors are easier to debug.

Related docs
------------

- [Authoring artifacts](authoring-artifacts.md) for overall package layout.
- [Variants guide](variants.md)
- [Branches guide](branches.md)
- [`README.md`](../README.md) for CLI basics
