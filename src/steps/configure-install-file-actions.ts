import { isNonEmptyRecord } from '@zokugun/is-it-type';
import { type AsyncDResult, OK } from '@zokugun/xtry';
import { isMatch } from 'micromatch';
import { type FileTransform } from '../types/config.js';
import { type Context } from '../types/context.js';
import { type Journey } from '../types/travel.js';
import { buildTravel } from '../utils/build-travel.js';

export async function configureInstallFileActions(context: Context): AsyncDResult {
	const { install } = context.incomingConfig!;

	if(!install) {
		return OK;
	}

	const overwrites: string[] = [];
	const filters: Record<string, string[]> = {};
	const routes: Record<string, Journey> = {};
	const transformations: Record<string, FileTransform[]> = {};

	for(const [file, fileUpdate] of Object.entries(install)) {
		const { filter, ifExists, rename, route, transforms } = fileUpdate;

		if(rename) {
			context.renamedPatterns.push({
				from: file,
				to: rename,
			});

			continue;
		}

		if(ifExists === 'overwrite') {
			overwrites.push(file);
		}
		else if(ifExists === 'remove') {
			context.removedPatterns.push(file);

			continue;
		}
		else if(ifExists === 'skip') {
			continue;
		}

		if(filter) {
			filters[file] = filter;
		}

		if(route) {
			const { alias } = route as { alias?: string };

			const travel = buildTravel(route);
			if(travel.fails) {
				return travel;
			}

			if(alias) {
				routes[file] = {
					alias,
					travel: travel.value,
				};
			}
			else {
				routes[file] = {
					travel: travel.value,
				};
			}
		}

		if(transforms) {
			transformations[file] = transforms;
		}
	}

	if(overwrites.length > 0) {
		context.onExisting = (file) => isMatch(file, overwrites) ? 'overwrite' : 'merge';
	}

	if(isNonEmptyRecord(filters)) {
		context.filters = (file) => {
			for(const [pattern, value] of Object.entries(filters)) {
				if(isMatch(file, pattern)) {
					return value;
				}
			}

			return undefined;
		};
	}

	if(isNonEmptyRecord(routes)) {
		context.routes = (file) => {
			for(const [pattern, route] of Object.entries(routes)) {
				if(isMatch(file, pattern)) {
					return route;
				}
			}

			return undefined;
		};
	}

	if(isNonEmptyRecord(transformations)) {
		context.transforms = (file) => {
			for(const [pattern, transforms] of Object.entries(transformations)) {
				if(isMatch(file, pattern)) {
					return transforms;
				}
			}

			return undefined;
		};
	}

	return OK;
}
