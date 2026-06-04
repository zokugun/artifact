import { isArray, isBoolean, isNonNullable, isRecord, isString } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { cloneDeep } from 'es-toolkit';
import { type RouteMeta, type RouteSpec, type ScopedJourneySpec, type ScopedRouteSpec, type FileTransform, type UpsertFileConfig } from '../../types/config.js';
import { getPreset } from '../presets/get-preset.js';
import { isTransform } from './is-transform.js';
import { normalizeRoute } from './normalize-route.js';

export function normalizeFileUpsert(pattern: string, data: unknown, name: 'install' | 'update' | 'upsert', version: number, journeys?: ScopedJourneySpec[], routes?: Record<string, ScopedRouteSpec>, gRoutes?: Record<string, RouteSpec>): DResult<UpsertFileConfig> { // {{{
	if(!isRecord(data)) {
		return err(`"${name}" must be an object.`);
	}

	let filter: string[] | undefined;
	let ifExists: 'force-merge' | 'merge' | 'overwrite' | 'remove' | 'skip' = 'merge';
	let ifMissing: 'merge' | 'skip' = 'merge';
	let rename: string | undefined;
	let route: RouteMeta | undefined;
	let transforms: FileTransform[] = [];

	if(isArray<string>(data.filter, isString)) {
		filter = data.filter;
	}

	if(isString(data.if_exists)) {
		if(data.if_exists === 'overwrite' || data.if_exists === 'remove' || data.if_exists === 'skip') {
			ifExists = data.if_exists;
		}
	}
	else if(data.overwrite === true) {
		ifExists = 'overwrite';
	}
	else if(data.remove === true) {
		ifExists = 'remove';
	}
	else if(isBoolean(data.update)) {
		ifExists = data.update ? 'force-merge' : 'skip';
	}

	if(data.missing === false || data.if_missing === 'skip') {
		ifMissing = 'skip';
	}

	if(isString(data.rename)) {
		rename = data.rename;
	}

	if(isNonNullable(data.route)) {
		const result = normalizeRoute(data.route, version, getPreset);
		if(result.fails) {
			return result;
		}

		route = result.value;

		if(isString(route) && version >= 3 && routes && gRoutes) {
			if(routes[route]) {
				route = cloneDeep(routes[route].meta);
			}
			else if(gRoutes[route]) {
				route = cloneDeep(gRoutes[route].meta);
			}
		}
	}

	if(isArray<FileTransform>(data.transforms, isTransform)) {
		transforms = data.transforms;
	}

	return ok({
		filter,
		ifExists,
		ifMissing,
		pattern,
		rename,
		route,
		transforms,
	});
} // }}}
