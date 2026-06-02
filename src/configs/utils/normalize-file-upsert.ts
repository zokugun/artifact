import { isArray, isBoolean, isRecord, isString } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { type FileTransform, type UpsertFileConfig } from '../../types/config.js';
import { type JourneyPlan, type Route } from '../../types/travel.js';
import { buildJourneyPlan } from '../../utils/build-journey-plan.js';
import { buildRoute } from '../../utils/build-route.js';
import { buildTravelPlan } from '../../utils/build-travel-plan.js';
import { isTransform } from './is-transform.js';
import { normalizeRoute } from './normalize-route.js';

export function normalizeFileUpsert(pattern: string, data: unknown, name: 'install' | 'update' | 'upsert', version: number, journeys?: Record<string, JourneyPlan>, routes?: Record<string, Route<any>>): DResult<UpsertFileConfig> { // {{{
	if(!isRecord(data)) {
		return err(`"${name}" must be an object.`);
	}

	let filter: string[] | undefined;
	let ifExists: 'force-merge' | 'merge' | 'overwrite' | 'remove' | 'skip' = 'merge';
	let ifMissing: 'merge' | 'skip' = 'merge';
	let rename: string | undefined;
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

	if(journeys && routes && isRecord(data.route) && version < 2) {
		const route = buildRoute(normalizeRoute(data.route, version));
		if(route.fails) {
			return route;
		}

		const travel = buildTravelPlan([pattern, route.value]);
		const journey = buildJourneyPlan(travel);

		journeys[pattern] = journey;
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
		transforms,
	});
} // }}}
