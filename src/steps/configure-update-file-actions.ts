import { isNonEmptyRecord } from '@zokugun/is-it-type';
import { type AsyncDResult, OK } from '@zokugun/xtry';
import { minimatch } from 'minimatch';
import { mergeUpsertProperty } from '../configs/utils/merge-upsert-property.js';
import { type UpsertFileConfig, type FileTransform } from '../types/config.js';
import { type ExistingAction, type Context } from '../types/context.js';
import { type Journey } from '../types/travel.js';
import { buildTravel } from '../utils/build-travel.js';

export async function configureUpdateFileActions(context: Context): AsyncDResult {
	const { update: packageUpdates } = context.incomingConfig!;
	const userUpdates = context.config.artifacts[context.incomingName!]?.update?.config;

	if(packageUpdates === false || userUpdates === false) {
		context.onExisting = () => 'skip';
		context.onMissing = () => 'skip';
	}
	else {
		const existingActions: Array<{ pattern: string; action: ExistingAction }> = [];
		const skipMissings: string[] = [];
		const filters: Record<string, string[]> = {};
		const routes: Record<string, Journey> = {};
		const transformations: Record<string, FileTransform[]> = {};

		const updates: UpsertFileConfig[] = [];

		if(userUpdates) {
			updates.push(...userUpdates);

			for(const update of packageUpdates) {
				const result = mergeUpsertProperty(update, updates);
				if(result.fails) {
					return result;
				}
			}
		}
		else {
			updates.push(...packageUpdates);
		}

		for(const { filter, ifExists, ifMissing, pattern, rename, route, transforms } of updates) {
			if(rename) {
				context.renamedPatterns.push({
					from: pattern,
					to: rename,
				});

				continue;
			}

			if(ifMissing === 'skip') {
				skipMissings.push(pattern);
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
				existingActions.push({ pattern, action: 'skip' });
			}

			if(filter) {
				filters[pattern] = filter;
			}

			if(route) {
				const travel = buildTravel(route, pattern);
				if(travel.fails) {
					return travel;
				}

				routes[pattern] = {
					travel: travel.value,
				};
			}

			if(transforms) {
				transformations[pattern] = transforms;
			}
		}

		if(skipMissings.length > 0) {
			context.onMissing = (file) => skipMissings.some((pattern) => minimatch(file, pattern)) ? 'skip' : 'continue';
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
	}

	return OK;
}
