import { isRecord } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { fork, type ForkParameter } from '../compositors/fork.js';
import { compose, mapSort } from '../compositors/index.js';
import { command, linesConcat, listConcat, mapConcat, overwrite, primitive } from '../routes/index.js';
import { type Route } from '../types/travel.js';

export function buildRoute(route: any): DResult<Route<any>> { // {{{
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
				return err('Can\'t build route');
			}
		}

		return ok(result);
	}
	else if(isRecord(route)) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const { compose: rtCompose, fork: rtFork, mapSort: rtMapSort } = route as { compose?: Record<string, any>; fork?: Record<string, any>; mapSort?: any };

		if(rtCompose) {
			const map = {};

			for(const [name, route] of Object.entries(rtCompose)) {
				const result = buildRoute(route);
				if(result.fails) {
					return result;
				}

				map[name] = result.value;
			}

			return ok(compose(map));
		}
		else if(rtFork) {
			const map: ForkParameter[] = [];

			if(rtFork.array) {
				const result = buildRoute(rtFork.array);
				if(result.fails) {
					return result;
				}

				map.push([Array.isArray, result.value]);
			}

			if(rtFork.object) {
				const result = buildRoute(rtFork.object);
				if(result.fails) {
					return result;
				}

				map.push([isRecord, result.value]);
			}

			if(rtFork.default) {
				const result = buildRoute(rtFork.default);
				if(result.fails) {
					return result;
				}

				map.push(result.value);
			}

			return ok(fork(...map));
		}
		else if(rtMapSort) {
			const result = buildRoute(rtMapSort);
			if(result.fails) {
				return result;
			}

			return ok(mapSort(result.value));
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
	else if(route === 'mapConcat') {
		return ok(mapConcat);
	}
	else if(route === 'overwrite') {
		return ok(overwrite);
	}
	else if(route === 'primitive') {
		return ok(primitive);
	}

	return err('Can\'t build route');
} // }}}
