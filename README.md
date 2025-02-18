[@zokugun/artifact](https://github.com/zokugun/artifact)
========================================================

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@zokugun/artifact.svg?colorB=green)](https://www.npmjs.com/package/@zokugun/artifact)
[![License](https://img.shields.io/badge/donate-ko--fi-green)](https://ko-fi.com/daiyam)
[![License](https://img.shields.io/badge/donate-liberapay-green)](https://liberapay.com/daiyam/donate)
[![License](https://img.shields.io/badge/donate-paypal-green)](https://paypal.me/daiyam99)

`artifact` is a command-line interface which allows you:
- to boilerplate your project from multiple packages
- to merge the duplicated configuration files found across the packages
- to keep your configurations up to date

Mergeable Files
---------------

- `*.json` (JSON or JSONC)
- `*.yml`
- `*.yaml`
- `*ignore`
- `*rc` (YAML, JSON or JSONC)

Getting Started
---------------

With [node](http://nodejs.org) previously installed:

    npm install -g @zokugun/artifact


Add the configuration packages:

```
artifact add @daiyam/lang-js @daiyam/lang-ts @daiyam/npm-ts
```

 With the previous command, `artifact` will pull the following packages:
- [@daiyam/artifact-lang-js](https://github.com/daiyam/artifact-configs/tree/master/packages/lang-js)
- [@daiyam/artifact-lang-ts](https://github.com/daiyam/artifact-configs/tree/master/packages/lang-ts)
- [@daiyam/artifact-npm-ts](https://github.com/daiyam/artifact-configs/tree/master/packages/npm-ts)

Like `yeoman`, a configuration package must be prefixed with `artifact-`.

Configuration Package
---------------------

The configuration/boilerplate files must be put inside the folder `configs`.

For example, the package [@daiyam/artifact-lang-js](https://github.com/daiyam/artifact-configs/tree/master/packages/lang-js):

```
artifact-configs/lang-js/
  ├── configs/
  │  ├── .commitlintrc.yml
  │  ├── .editorconfig
  │  ├── .lintstagedrc
  │  ├── gitignore
  │  ├── package.json
  │  └── ...
  ├── LICENSE
  ├── package.json
  └── README.md
```

Update
------

Update your configurations with the command:

```
artifact update
```

It is **recommended** to review the changes and manually revert any bad changes.

Furthermore, a configuration package can control how to apply an update via the file `.artifactrc`.

Yeoman
------

`artifact` can be used in a yeoman generator. Ex: [@daiyam/generator-new-project](https://github.com/daiyam/generator-new-project)

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
