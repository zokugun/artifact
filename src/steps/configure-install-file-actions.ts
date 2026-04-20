import { isNonEmptyRecord } from '@zokugun/is-it-type';
import { type AsyncDResult, OK } from '@zokugun/xtry';
import { isMatch } from 'micromatch';
import { type FileTransform } from '../types/config.js';
import { type ExistingAction, type Context } from '../types/context.js';
import { type Journey } from '../types/travel.js';
import { buildTravel } from '../utils/build-travel.js';

export async function configureInstallFileActions(context: Context): AsyncDResult {
	const { install } = context.incomingConfig!;

	if(!install) {
		return OK;
	}

	const existingActions: Array<{ pattern: string; action: ExistingAction }> = [];
	const filters: Record<string, string[]> = {};
	const routes: Record<string, Journey> = {};
	const transformations: Record<string, FileTransform[]> = {};

	for(const file of install) {
		const { filter, ifExists, pattern, rename, route, transforms } = file;

		if(rename) {
			context.renamedPatterns.push({
				from: pattern,
				to: rename,
			});

			continue;
		}

		if(ifExists === 'force-merge') {
			existingActions.push({ pattern, action: 'merge' });
		}
		else if(ifExists === 'overwrite') {
			existingActions.push({ pattern, action: 'overwrite' });
		}
		else if(ifExists === 'remove') {
			context.removedPatterns.push(pattern);

			continue;
		}
		else if(ifExists === 'skip') {
			continue;
		}

		if(filter) {
			filters[pattern] = filter;
		}

		if(route) {
			const { alias } = route as { alias?: string };

			const travel = buildTravel(route);
			if(travel.fails) {
				return travel;
			}

			if(alias) {
				routes[pattern] = {
					alias,
					travel: travel.value,
				};
			}
			else {
				routes[pattern] = {
					travel: travel.value,
				};
			}
		}

		if(transforms) {
			transformations[pattern] = transforms;
		}
	}

	if(existingActions.length > 0) {
		context.onExisting = (file) => {
			for(const { pattern, action } of existingActions) {
				if(isMatch(file, pattern)) {
					return action;
				}
			}

			return 'merge';
		};
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
