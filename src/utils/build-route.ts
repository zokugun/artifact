import { isRecord } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { fork, type ForkParameter } from '../compositors/fork.js';
import { compose, json, mapSort, yaml } from '../compositors/index.js';
import { command, linesConcat, listConcat, listConcatAfter, mapConcat, mergeDotJs, overwrite, primitive } from '../routes/index.js';
import { type Route } from '../types/travel.js';

export function buildRoute(route: unknown): DResult<Route<any>> { // {{{
	if(Array.isArray(route) && route.length > 0) {
		const buildResult = buildRoute(route[0]);
		if(buildResult.fails) {
			return buildResult;
		}

		let result = buildResult.value;

		for(let i = 1; i < route.length; i++) {
			if(route[i] === 'mapSort') {
				result = mapSort(result);
			}
			else {
				return err(`Cannot build route "${JSON.stringify(route)}"`);
			}
		}

		return ok(result);
	}
	else if(isRecord(route)) {
		if(isRecord(route.compose)) {
			const map = {};
			const entries = Object.entries(route.compose);

			for(const [name, route] of entries) {
				if(name === '$$ignore' || name === '$$remove') {
					map[name] = route;
				}
				else {
					const result = buildRoute(route);
					if(result.fails) {
						return result;
					}

					map[name] = result.value;
				}
			}

			return ok(compose(map));
		}
		else if(isRecord(route.fork)) {
			const map: ForkParameter[] = [];

			if(route.fork.array) {
				const result = buildRoute(route.fork.array);
				if(result.fails) {
					return result;
				}

				map.push([Array.isArray, result.value]);
			}

			if(route.fork.object) {
				const result = buildRoute(route.fork.object);
				if(result.fails) {
					return result;
				}

				map.push([isRecord, result.value]);
			}

			if(route.fork.default) {
				const result = buildRoute(route.fork.default);
				if(result.fails) {
					return result;
				}

				map.push(result.value);
			}
			else if(route.fork.$$default) {
				const result = buildRoute(route.fork.$$default);
				if(result.fails) {
					return result;
				}

				map.push(result.value);
			}

			return ok(fork(...map));
		}
		else if(route.json) {
			const result = buildRoute(route.json);
			if(result.fails) {
				return result;
			}

			return ok(json(result.value));
		}
		else if(route.mapSort) {
			const result = buildRoute(route.mapSort);
			if(result.fails) {
				return result;
			}

			return ok(mapSort(result.value));
		}
		else if(route.yaml) {
			const result = buildRoute(route.yaml);
			if(result.fails) {
				return result;
			}

			return ok(yaml(result.value));
		}
	}
	else if(route === 'command') {
		return ok(command);
	}
	else if(route === 'linesConcat') {
		return ok(linesConcat);
	}
	else if(route === 'listConcat') {
		return ok(listConcat);
	}
	else if(route === 'listConcatAfter') {
		return ok(listConcatAfter);
	}
	else if(route === 'mapConcat') {
		return ok(mapConcat);
	}
	else if(route === 'mergeDotJs') {
		return ok(mergeDotJs);
	}
	else if(route === 'overwrite') {
		return ok(overwrite);
	}
	else if(route === 'primitive') {
		return ok(primitive);
	}

	return err(`Cannot build route "${JSON.stringify(route)}"`);
} // }}}
