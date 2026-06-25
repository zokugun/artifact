import { isNonEmptyRecord } from '@zokugun/is-it-type';
import { type AsyncDResult, OK } from '@zokugun/xtry';
import { minimatch } from 'minimatch';
import { type FileTransform } from '../types/config.js';
import { type ExistingAction, type Context } from '../types/context.js';
import { type Journey } from '../types/travel.js';

export async function configureInstallFileActions(context: Context): AsyncDResult {
	if(!context.incomingConfig) {
		return OK;
	}

	const { install } = context.incomingConfig;

	if(!install) {
		return OK;
	}

	const existingActions: Array<{ pattern: string; action: ExistingAction }> = [];
	const filters: Record<string, string[]> = {};
	const routes: Record<string, Journey> = {};
	const transformations: Record<string, FileTransform[]> = {};

	for(const file of install) {
		const { filter, ifExists, pattern, rename, transforms } = file;

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

		if(transforms) {
			transformations[pattern] = transforms;
		}
	}

	if(existingActions.length > 0) {
		context.onExisting = (file) => {
			for(const { pattern, action } of existingActions) {
				if(minimatch(file, pattern)) {
					return action;
				}
			}

			return 'merge';
		};
	}

	if(isNonEmptyRecord(filters)) {
		context.filters = (file) => {
			for(const [pattern, value] of Object.entries(filters)) {
				if(minimatch(file, pattern)) {
					return value;
				}
			}

			return undefined;
		};
	}

	if(isNonEmptyRecord(routes)) {
		context.routes = (file) => {
			for(const [pattern, route] of Object.entries(routes)) {
				if(minimatch(file, pattern)) {
					return route;
				}
			}

			return undefined;
		};
	}

	if(isNonEmptyRecord(transformations)) {
		context.transforms = (file) => {
			for(const [pattern, transforms] of Object.entries(transformations)) {
				if(minimatch(file, pattern)) {
					return transforms;
				}
			}

			return undefined;
		};
	}

	return OK;
}
