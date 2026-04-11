import { isEmpty, isPlainObject } from 'lodash-es';
import { isMatch } from 'micromatch';
import { type ForkParameter } from '../compositors/fork.js';
import { compose, fork, json, mapSort, rc, yaml } from '../compositors/index.js';
import { command, linesConcat, listConcat, mapConcat, overwrite, primitive } from '../routes/index.js';
import { type ExistingAction, type Context } from '../types/context.js';
import { type Journey, type Route } from '../types/travel.js';

function buildRoute(route: any): Route<any> { // {{{
	if(Array.isArray(route) && route.length > 0) {
		let result = buildRoute(route[0]);

		for(let i = 1; i < route.length; i++) {
			if(route[i] === 'mapSort') {
				result = mapSort(result);
			}
			else {
				throw new Error('Can\'t build route');
			}
		}

		return result;
	}
	else if(isPlainObject(route)) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const { compose: rtCompose, fork: rtFork, mapSort: rtMapSort } = route as { compose?: Record<string, any>; fork?: Record<string, any>; mapSort?: any };

		if(rtCompose) {
			const map = {};

			for(const [name, route] of Object.entries(rtCompose)) {
				map[name] = buildRoute(route);
			}

			return compose(map);
		}
		else if(rtFork) {
			const map: ForkParameter[] = [];

			if(rtFork.array) {
				map.push([Array.isArray, buildRoute(rtFork.array)]);
			}

			if(rtFork.object) {
				map.push([isPlainObject, buildRoute(rtFork.object)]);
			}

			if(rtFork.default) {
				map.push(buildRoute(rtFork.default));
			}

			return fork(...map);
		}
		else if(rtMapSort) {
			return mapSort(buildRoute(rtMapSort));
		}
	}
	else if(route === 'command') {
		return command;
	}
	else if(route === 'linesConcat') {
		return linesConcat;
	}
	else if(route === 'listConcat') {
		return listConcat;
	}
	else if(route === 'mapConcat') {
		return mapConcat;
	}
	else if(route === 'overwrite') {
		return overwrite;
	}
	else if(route === 'primitive') {
		return primitive;
	}

	throw new Error('Can\'t build route');
} // }}}

function buildTravel(route: Record<string, any>): Route<string> { // {{{
	if(route.json) {
		return json(buildRoute(route.json));
	}
	else if(route.rc) {
		return rc(buildRoute(route.rc));
	}
	else if(route.yaml) {
		return yaml(buildRoute(route.yaml));
	}
	else {
		throw new Error('Can\'t build route');
	}
} // }}}

export async function configureUpdateFileActions(context: Context): Promise<void> {
	const { update } = context.incomingConfig!;

	if(typeof update === 'boolean') {
		if(!update) {
			context.onExisting = () => 'skip';
			context.onMissing = () => 'skip';
		}
	}
	else if(isPlainObject(update)) {
		const existingActions: Record<Exclude<ExistingAction, 'merge'>, string[]> = {
			overwrite: [],
			skip: [],
		};
		const skipMissings: string[] = [];
		const filters: Record<string, string[]> = {};
		const routes: Record<string, Journey> = {};

		for(const [file, fileUpdate] of Object.entries(update)) {
			const { filter, missing, overwrite, remove, rename, route, update } = fileUpdate;

			if(missing === false) {
				skipMissings.push(file);
			}

			if(update === false) {
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

				if(alias) {
					routes[file] = {
						alias,
						travel: buildTravel(route),
					};
				}
				else {
					routes[file] = {
						travel: buildTravel(route),
					};
				}
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

		if(!isEmpty(filters)) {
			context.filters = (file) => {
				for(const [pattern, value] of Object.entries(filters)) {
					if(isMatch(file, pattern)) {
						return value;
					}
				}

				return undefined;
			};
		}

		if(!isEmpty(routes)) {
			context.routes = (file) => {
				for(const [pattern, route] of Object.entries(routes)) {
					if(isMatch(file, pattern)) {
						return route;
					}
				}

				return undefined;
			};
		}
	}
}
