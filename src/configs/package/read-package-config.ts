import path from 'path';
import fse from '@zokugun/fs-extra-plus/async';
import { isNumber, isRecord, isString } from '@zokugun/is-it-type';
import { type AsyncDResult, type DResult, err, ok } from '@zokugun/xtry';
import yaml from 'yaml';
import { type FileUninstall, type FileInstall, type FileUpdate, type PackageConfig } from '../../types/config.js';
import { MAX_VERSION, CONFIG_LOCATIONS, VERSION_PACKAGE_REGEX } from '../utils/constants.js';
import { normalizeFileAlways } from '../utils/normalize-file-always.js';
import { normalizeFileUninstall } from '../utils/normalize-file-uninstall.js';
import { normalizeFileUpsert } from '../utils/normalize-file-upsert.js';

export async function readPackageConfig(targetPath: string): AsyncDResult<PackageConfig> {
	let content: string | undefined;
	let name: string | undefined;
	let type: string | undefined;

	for(const place of CONFIG_LOCATIONS) {
		const result = await fse.readFile(path.join(targetPath, place.name), 'utf8');

		if(!result.fails) {
			content = result.value;

			({ name, type } = place);
		}
	}

	if(!content) {
		return normalizeConfig(content, name!);
	}

	if(type === 'json') {
		return normalizeConfig(JSON.parse(content), name!);
	}
	else if(type === 'yaml') {
		return normalizeConfig(yaml.parse(content), name!);
	}
	else {
		try {
			return normalizeConfig(JSON.parse(content), name!);
		}
		catch {
			return normalizeConfig(yaml.parse(content), name!);
		}
	}
}

function normalizeConfig(data: unknown, source: string): DResult<PackageConfig> { // {{{
	let constants: Record<string, string> = {};
	let xtends: string | undefined;
	const install: Record<string, FileInstall> = {};
	let orphan: boolean = false;
	const uninstall: Record<string, FileUninstall> = {};
	let update: false | Record<string, FileUpdate> = {};
	let variables: Record<string, string> = {};
	let variants: Record<string, string> = {};

	if(!data) {
		return ok({
			constants,
			extends: xtends,
			install,
			orphan,
			uninstall,
			update,
			variables,
			variants,
		});
	}

	if(!isRecord(data)) {
		return err(`Config file ${source} must export an object.`);
	}

	if(isString(data.$schema)) {
		const match = VERSION_PACKAGE_REGEX.exec(data.$schema);
		if(!match) {
			return err(`Cannot validate the "$schema" in the package's "${source}".`);
		}

		const version = Number.parseInt(match[2], 10);
		if(version > MAX_VERSION) {
			return err(`Don't support newer version (v${version}) in the package's "${source}".`);
		}
	}

	if(isRecord<string>(data.constants, (_key, value) => isString(value))) {
		constants = data.constants;
	}

	if(isString(data.extends)) {
		xtends = data.extends;
	}
	else if(isNumber(data.extends)) {
		xtends = String(data.extends);
	}

	if(data.orphan === true) {
		orphan = true;
	}

	if(isRecord<string>(data.variables, (_key, value) => isString(value))) {
		variables = data.variables;
	}

	if(isRecord<string | number>(data.variants, (_key, value) => isString(value) || isNumber(value))) {
		variants = Object.fromEntries(Object.entries(data.variants).map(([key, value]) => [key, isNumber(value) ? String(value) : value]));
	}

	if(isRecord(data.always)) {
		for(const [key, value] of Object.entries(data.always)) {
			const normalized = normalizeFileAlways(value);
			if(normalized.fails) {
				return normalized;
			}

			const { ifExists, transforms } = normalized.value;

			install[key] = {
				...normalized.value,
				ifMissing: 'merge',
			};

			uninstall[key] = {
				ifExists: ifExists === 'force-merge' || ifExists === 'merge' || ifExists === 'overwrite' ? 'skip' : ifExists,
				transforms,
			};

			update[key] = {
				...normalized.value,
				ifMissing: 'merge',
			};
		}
	}

	if(isRecord(data.upsert)) {
		for(const [key, value] of Object.entries(data.upsert)) {
			const normalized = normalizeFileUpsert(value, 'upsert');
			if(normalized.fails) {
				return normalized;
			}

			install[key] = normalized.value;

			update[key] = {
				...normalized.value,
			};
		}
	}

	if(isRecord(data.install)) {
		for(const [key, value] of Object.entries(data.install)) {
			const normalized = normalizeFileUpsert(value, 'install');
			if(normalized.fails) {
				return normalized;
			}

			if(install[key]) {
				return err(`Conflict with the "${key}" key on "install".`);
			}

			install[key] = normalized.value;
		}
	}

	if(isRecord(data.uninstall)) {
		for(const [key, value] of Object.entries(data.uninstall)) {
			const normalized = normalizeFileUninstall(value);
			if(normalized.fails) {
				return normalized;
			}

			uninstall[key] = normalized.value;
		}
	}

	if(data.update === false) {
		update = false;
	}
	else if(isRecord(data.update)) {
		for(const [key, value] of Object.entries(data.update)) {
			const normalized = normalizeFileUpsert(value, 'update');
			if(normalized.fails) {
				return normalized;
			}

			if(update[key]) {
				return err(`Conflict with the "${key}" key on "update".`);
			}

			update[key] = normalized.value;
		}
	}

	return ok({
		constants,
		extends: xtends,
		install,
		orphan,
		uninstall,
		update,
		variables,
		variants,
	});
} // }}}
