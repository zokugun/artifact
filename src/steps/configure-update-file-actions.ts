import { isNonEmptyRecord } from '@zokugun/is-it-type';
import { type AsyncDResult, OK } from '@zokugun/xtry';
import { isMatch } from 'micromatch';
import { type FileTransform } from '../types/config.js';
import { type ExistingAction, type Context } from '../types/context.js';
import { type Journey } from '../types/travel.js';
import { buildTravel } from '../utils/build-travel.js';

export async function configureUpdateFileActions(context: Context): AsyncDResult {
	const { update } = context.incomingConfig!;

	if(update === false) {
		context.onExisting = () => 'skip';
		context.onMissing = () => 'skip';
	}
	else {
		const existingActions: Record<Exclude<ExistingAction, 'merge'>, string[]> = {
			overwrite: [],
			skip: [],
		};
		const skipMissings: string[] = [];
		const filters: Record<string, string[]> = {};
		const routes: Record<string, Journey> = {};
		const transformations: Record<string, FileTransform[]> = {};

		for(const [file, fileUpdate] of Object.entries(update)) {
			const { filter, missing, overwrite, remove, rename, route, transforms, update } = fileUpdate;

			if(!missing) {
				skipMissings.push(file);
			}

			if(!update) {
				existingActions.skip.push(file);
			}
			else if(overwrite) {
				existingActions.overwrite.push(file);
			}
			else if(remove) {
				context.removedPatterns.push(file);

				continue;
			}
			else if(rename) {
				context.renamedPatterns.push({
					from: file,
					to: rename,
				});

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

		if(skipMissings.length > 0) {
			context.onMissing = (file) => isMatch(file, skipMissings) ? 'skip' : 'continue';
		}

		if(existingActions.overwrite.length > 0 || existingActions.skip.length > 0) {
			context.onExisting = (file) => {
				for(const [action, files] of Object.entries(existingActions)) {
					if(isMatch(file, files)) {
						return action as ExistingAction;
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
	}

	return OK;
}
