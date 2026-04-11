import path from 'path';
import { isArray, isNumber, isRecord, isString } from '@zokugun/is-it-type';
import fse from 'fs-extra';
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

export async function readPackageConfig(targetPath: string): Promise<PackageConfig> {
	let content: string | undefined;
	let name: string | undefined;
	let type: string | undefined;

	for(const place of places) {
		try {
			content = await fse.readFile(path.join(targetPath, place.name), 'utf8');
			name = place.name;
			type = place.type;

			break;
		}
		catch {
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

function normalizeConfig(data: unknown, source: string): PackageConfig { // {{{
	let constants: Record<string, string> = {};
	let xtends: string | undefined;
	const install: Record<string, FileInstall> = {};
	let orphan: boolean = false;
	const uninstall: Record<string, FileUninstall> = {};
	let update: false | Record<string, FileUpdate> = {};
	let variables: Record<string, string> = {};
	let variants: Record<string, string> = {};

	if(!data) {
		return {
			constants,
			extends: xtends,
			install,
			orphan,
			uninstall,
			update,
			variables,
			variants,
		};
	}

	if(!isRecord(data)) {
		throw new Error(`Config file ${source} must export an object.`);
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
			const normalizedValue = normalizeUpsert(value, 'upsert');

			if(normalizedValue) {
				install[key] = normalizedValue;

				update[key] = {
					...normalizedValue,
					missing: true,
					update: true,
				};
			}
		}
	}

	if(isRecord(data.install)) {
		for(const [key, value] of Object.entries(data.install)) {
			const normalizedValue = normalizeUpsert(value, 'install');

			if(normalizedValue) {
				if(install[key]) {
					throw new Error(`Conflict with the "${key}" key on "install".`);
				}

				install[key] = normalizedValue;
			}
		}
	}

	if(isRecord(data.uninstall)) {
		for(const [key, value] of Object.entries(data.uninstall)) {
			const normalizedValue = normalizeUninstall(value);

			if(normalizedValue) {
				uninstall[key] = normalizedValue;
			}
		}
	}

	if(data.update === false) {
		update = false;
	}
	else if(isRecord(data.update)) {
		for(const [key, value] of Object.entries(data.update)) {
			const normalizedValue = normalizeUpdate(value);

			if(normalizedValue) {
				if(update[key]) {
					throw new Error(`Conflict with the "${key}" key on "update".`);
				}

				update[key] = normalizedValue;
			}
		}
	}

	return {
		constants,
		extends: xtends,
		install,
		orphan,
		uninstall,
		update,
		variables,
		variants,
	};
} // }}}

function normalizeUninstall(data: unknown): FileUninstall | undefined { // {{{
	if(!isRecord(data)) {
		throw new Error('"uninstall" must be an object.');
	}

	let remove: boolean = false;

	if(data.remove === true) {
		remove = true;
	}

	return {
		remove,
	};
} // }}}

function normalizeUpdate(data: unknown): FileUpdate | undefined { // {{{
	if(!isRecord(data)) {
		throw new Error('"update" must be an object.');
	}

	const upsert = normalizeUpsert(data, 'update');

	if(!upsert) {
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

	return {
		...upsert,
		missing,
		update,
	};
} // }}}

function normalizeUpsert(data: unknown, name: string): FileUpsert | undefined { // {{{
	if(!isRecord(data)) {
		throw new Error(`"${name}" must be an object.`);
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

	return {
		filter,
		overwrite,
		remove,
		rename,
		route,
	};
} // }}}
