import path from 'path';
import fse from '@zokugun/fs-extra-plus/async';
import { isArray, isNumber, isRecord, isString } from '@zokugun/is-it-type';
import { type AsyncDResult, type DResult, err, ok } from '@zokugun/xtry';
import yaml from 'yaml';
import { type FileUninstall, type FileInstall, type FileUpdate, type FileUpsert, type PackageConfig } from '../../types/config.js';

const places = [
	{
		name: '.artifactrc.yml',
		type: 'yaml',
	},
	{
		name: '.artifactrc.yaml',
		type: 'yaml',
	},
	{
		name: '.artifactrc.json',
		type: 'json',
	},
	{
		name: '.artifactrc',
	},
];

export async function readPackageConfig(targetPath: string): AsyncDResult<PackageConfig> {
	let content: string | undefined;
	let name: string | undefined;
	let type: string | undefined;

	for(const place of places) {
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

	if(isRecord(data.upsert)) {
		for(const [key, value] of Object.entries(data.upsert)) {
			const normalized = normalizeUpsert(value, 'upsert');
			if(normalized.fails) {
				return normalized;
			}

			install[key] = normalized.value;

			update[key] = {
				...normalized.value,
				missing: true,
				update: true,
			};
		}
	}

	if(isRecord(data.install)) {
		for(const [key, value] of Object.entries(data.install)) {
			const normalized = normalizeUpsert(value, 'install');
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
			const normalized = normalizeUninstall(value);
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
			const normalized = normalizeUpdate(value);
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

function normalizeUninstall(data: unknown): DResult<FileUninstall> { // {{{
	if(!isRecord(data)) {
		return err('"uninstall" must be an object.');
	}

	let remove: boolean = false;

	if(data.remove === true) {
		remove = true;
	}

	return ok({
		remove,
	});
} // }}}

function normalizeUpdate(data: unknown): DResult<FileUpdate> { // {{{
	if(!isRecord(data)) {
		return err('"update" must be an object.');
	}

	const upsert = normalizeUpsert(data, 'update');

	if(upsert.fails) {
		return upsert;
	}

	let missing: boolean = true;
	let update: boolean = true;

	if(data.missing === false) {
		missing = false;
	}

	if(data.update === false) {
		update = false;
	}

	return ok({
		...upsert.value,
		missing,
		update,
	});
} // }}}

function normalizeUpsert(data: unknown, name: string): DResult<FileUpsert> { // {{{
	if(!isRecord(data)) {
		return err(`"${name}" must be an object.`);
	}

	let filter: string[] | undefined;
	let overwrite: boolean = false;
	let remove: boolean = false;
	let rename: string | undefined;
	let route: Record<string, any> | undefined;

	if(isArray<string>(data.filter, isString)) {
		filter = data.filter;
	}

	if(data.overwrite === true) {
		overwrite = true;
	}

	if(data.remove === true) {
		remove = true;
	}

	if(isString(data.rename)) {
		rename = data.rename;
	}

	if(isRecord(data.route)) {
		route = data.route;
	}

	return ok({
		filter,
		overwrite,
		remove,
		rename,
		route,
	});
} // }}}
