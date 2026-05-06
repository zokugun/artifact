import path from 'path';
import fse from '@zokugun/fs-extra-plus/async';
import { isArray, isNonBlankString, isNonNullable, isNumber, isPrimitive, isRecord, isString, type Primitive } from '@zokugun/is-it-type';
import { type AsyncDResult, type DResult, err, ok } from '@zokugun/xtry';
import YAML from 'yaml';
import { codec, json, yaml } from '../../compositors/index.js';
import { toFormat } from '../../parsers/to-format.js';
import { type UninstallFileConfig, type InstallFileConfig, type UpdateFileConfig, type PackageConfig } from '../../types/config.js';
import { type JourneyPlan, type Route } from '../../types/travel.js';
import { buildJourneyPlan } from '../../utils/build-journey-plan.js';
import { buildRoute } from '../../utils/build-route.js';
import { buildTravelPlan } from '../../utils/build-travel-plan.js';
import { MAX_VERSION, CONFIG_LOCATIONS, VERSION_PACKAGE_REGEX } from '../utils/constants.js';
import { mergeUpsertProperty } from '../utils/merge-upsert-property.js';
import { normalizeFileAlways } from '../utils/normalize-file-always.js';
import { normalizeFileUninstall } from '../utils/normalize-file-uninstall.js';
import { normalizeFileUpsert } from '../utils/normalize-file-upsert.js';

export async function readPackageConfig(targetPath: string, gRoutes: Record<string, Route<any>>): AsyncDResult<PackageConfig> {
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
		return normalizeConfig(content, name!, gRoutes);
	}

	if(type === 'json') {
		return normalizeConfig(JSON.parse(content), name!, gRoutes);
	}
	else if(type === 'yaml') {
		return normalizeConfig(YAML.parse(content), name!, gRoutes);
	}
	else {
		try {
			return normalizeConfig(JSON.parse(content), name!, gRoutes);
		}
		catch {
			return normalizeConfig(YAML.parse(content), name!, gRoutes);
		}
	}
}

function normalizeConfig(data: unknown, source: string, gRoutes: Record<string, Route<any>>): DResult<PackageConfig> { // {{{
	let xtends: string | undefined;
	const install: InstallFileConfig[] = [];
	const journeys: Record<string, JourneyPlan> = {};
	let orphan: boolean = false;
	const routes: Record<string, Route<any>> = {};
	const uninstall: UninstallFileConfig[] = [];
	let update: false | UpdateFileConfig[] = [];
	let variables: Record<string, Primitive> = {};
	let variants: Record<string, string> = {};

	if(!data) {
		return ok({
			extends: xtends,
			install,
			journeys,
			orphan,
			routes,
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

	if(isString(data.extends)) {
		xtends = data.extends;
	}
	else if(isNumber(data.extends)) {
		xtends = String(data.extends);
	}

	if(data.orphan === true) {
		orphan = true;
	}

	if(isRecord<Primitive>(data.variables, (_key, value) => isPrimitive(value))) {
		variables = data.variables;
	}

	if(isRecord<string | number>(data.variants, (_key, value) => isString(value) || isNumber(value))) {
		variants = Object.fromEntries(Object.entries(data.variants).map(([key, value]) => [key, isNumber(value) ? String(value) : value]));
	}

	if(isRecord(data.install)) {
		for(const [key, value] of Object.entries(data.install)) {
			const normalized = normalizeFileUpsert(key, value, 'install', journeys, routes);
			if(normalized.fails) {
				return normalized;
			}

			install.push(normalized.value);
		}
	}

	if(data.update === false) {
		update = false;
	}
	else if(isRecord(data.update)) {
		for(const [key, value] of Object.entries(data.update)) {
			const normalized = normalizeFileUpsert(key, value, 'update', journeys, routes);
			if(normalized.fails) {
				return normalized;
			}

			update.push(normalized.value);
		}
	}

	if(isRecord(data.uninstall)) {
		for(const [key, value] of Object.entries(data.uninstall)) {
			const normalized = normalizeFileUninstall(key, value);
			if(normalized.fails) {
				return normalized;
			}

			uninstall.push(normalized.value);
		}
	}

	if(isRecord(data.upsert)) {
		for(const [key, value] of Object.entries(data.upsert)) {
			const normalized = normalizeFileUpsert(key, value, 'upsert', journeys, routes);
			if(normalized.fails) {
				return normalized;
			}

			const result = mergeUpsertProperty(normalized.value, install);
			if(result.fails) {
				return result;
			}

			if(update) {
				const result = mergeUpsertProperty(normalized.value, update);
				if(result.fails) {
					return result;
				}
			}
		}
	}

	if(isRecord(data.always)) {
		for(const [key, value] of Object.entries(data.always)) {
			const normalized = normalizeFileAlways(key, value);
			if(normalized.fails) {
				return normalized;
			}

			const { ifExists, pattern, transforms } = normalized.value;

			const result = mergeUpsertProperty({
				...normalized.value,
				ifMissing: 'merge',
			}, install);

			if(result.fails) {
				return result;
			}

			if(update) {
				const result = mergeUpsertProperty({
					...normalized.value,
					ifMissing: 'merge',
				}, update);

				if(result.fails) {
					return result;
				}
			}

			uninstall.push({
				ifExists: ifExists === 'force-merge' || ifExists === 'merge' || ifExists === 'overwrite' ? 'skip' : ifExists,
				pattern,
				transforms,
			});
		}
	}

	if(isRecord(data.routes)) {
		for(const [key, value] of Object.entries(data.routes)) {
			const route = buildRoute(value);
			if(route.fails) {
				return route;
			}

			routes[key] = route.value;
		}
	}

	if(isArray(data.journeys)) {
		for(const value of data.journeys) {
			if(!isRecord(value)) {
				return err('Journey must be an object.');
			}

			if(!isNonBlankString<string>(value.name)) {
				return err('Journey\'s name must be a string.');
			}

			const { name } = value;

			let route: Route<any> | undefined;

			if(isString(value.route)) {
				route = routes[value.route] ?? gRoutes[value.route];
			}

			if(!route) {
				const result = buildRoute(value.route);
				if(result.fails) {
					return result;
				}

				route = result.value;
			}

			if(!route) {
				return err('Cannot find journey\'s route.');
			}

			const travels: Array<[string, Route<any>]> = [];

			if(isArray(value.travels)) {
				for(const data of value.travels) {
					if(!isRecord(data)) {
						return err('Travel must be an object.');
					}

					if(!isNonBlankString<string>(data.path)) {
						return err('Travel\'s path must be a string.');
					}

					const { path } = data;

					let finalRoute: Route<any> | undefined;

					if(isNonNullable(data.format)) {
						if(data.format === 'json') {
							finalRoute = json(route);
						}
						else if(data.format === 'yaml') {
							finalRoute = yaml(route);
						}
						else if(isArray<Parameters<typeof toFormat>[0]>(data.format, (value) => value === 'json' || value === 'jsonc' || value === 'yaml')) {
							const codecs = data.format.map((value) => toFormat(value));

							finalRoute = codec(codecs, route);
						}
					}
					else if(path.endsWith('.json')) {
						finalRoute = json(route);
					}
					else if(path.endsWith('.yaml') || path.endsWith('.yml')) {
						finalRoute = yaml(route);
					}
					else if(path.endsWith('.js') || path.endsWith('.cjs') || path.endsWith('.mjs') || path.endsWith('.ts')) {
						finalRoute = route;
					}

					if(!finalRoute) {
						return err('Cannot find travel\'s path\'s route.');
					}

					travels.push([path, finalRoute]);
				}
			}

			const travel = buildTravelPlan(...travels);
			const journey = buildJourneyPlan(travel);

			journeys[name] = journey;
		}
	}

	return ok({
		extends: xtends,
		install,
		journeys,
		orphan,
		routes,
		uninstall,
		update,
		variables,
		variants,
	});
} // }}}
