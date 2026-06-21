import { isRecord, isString } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { patch } from 'ultrapatch';
import { type RouteMeta } from '../../types/config.js';

const ROUTE_V2_TO_V3 = {
	linesConcat: 'line(concat)',
	listConcat: 'list(concat)',
	listConcatAfter: 'list(dedup-first)',
	mapConcat: 'map(concat)',
	mapSort: 'map(sort)',
	mergeDotJs: 'ts(merge)',
};

export function normalizeRoute(route: unknown, version: number, getRoute: (name: string) => RouteMeta | undefined): DResult<RouteMeta> {
	if(Array.isArray(route)) {
		if(route.length === 0) {
			return err(`Cannot normalize route "${JSON.stringify(route)}"`);
		}

		const reversedRoutes = version >= 3 ? route.reverse() : route;

		let newRoute = reversedRoutes.shift() as unknown;

		for(const subroute of reversedRoutes) {
			newRoute = {
				[subroute]: newRoute,
			};
		}

		return normalizeRoute(newRoute, version, getRoute);
	}

	if(isRecord(route)) {
		if(isRecord(route.fork)) {
			if(route.fork.array) {
				const result = normalizeRoute(route.fork.array, version, getRoute);
				if(result.fails) {
					return result;
				}

				route.fork.array = result.value;
			}

			if(route.fork.object) {
				const result = normalizeRoute(route.fork.object, version, getRoute);
				if(result.fails) {
					return result;
				}

				route.fork.object = result.value;
			}

			if(route.fork.default) {
				const result = normalizeRoute(route.fork.default, version, getRoute);
				if(result.fails) {
					return result;
				}

				route.fork.default = result.value;
			}

			else if(route.fork.$$default) {
				const result = normalizeRoute(route.fork.$$default, version, getRoute);
				if(result.fails) {
					return result;
				}

				route.fork.$$default = result.value;
			}
		}
		else if(route.json) {
			const result = normalizeRoute(route.json, version, getRoute);
			if(result.fails) {
				return result;
			}

			route.json = result.value;
		}

		else if(route.yaml) {
			const result = normalizeRoute(route.yaml, version, getRoute);
			if(result.fails) {
				return result;
			}

			route.yaml = result.value;
		}

		if(version >= 3) {
			if(isRecord(route['map(compose)'])) {
				const map = route['map(compose)'];

				for(const name of Object.keys(map)) {
					if(!name.startsWith('$$') || name === '$$default') {
						const result = normalizeRoute(map[name], version, getRoute);
						if(result.fails) {
							return result;
						}

						map[name] = result.value;
					}
				}
			}
			else if(isRecord(route['map(filter)'])) {
				const result = normalizeRoute(route['map(filter)'].$$default, version, getRoute);
				if(result.fails) {
					return result;
				}

				route['map(filter)'].$$default = result.value;
			}
			else if(route['map(sort)']) {
				const result = normalizeRoute(route['map(sort)'], version, getRoute);
				if(result.fails) {
					return result;
				}

				route['map(sort)'] = result.value;
			}
			else if(route['map(sort, compose)']) {
				const map = route['map(sort, compose)'];

				for(const name of Object.keys(map)) {
					if(!name.startsWith('$$') || name === '$$default') {
						const result = normalizeRoute(map[name], version, getRoute);
						if(result.fails) {
							return result;
						}

						map[name] = result.value;
					}
				}

				route['map(sort)'] = {
					'map(compose)': map,
				};
				route['map(sort, compose)'] = undefined;
			}
			else if(isString(route.$$extend)) {
				let newRoute = getRoute(route.$$extend);

				if(isRecord(newRoute)) {
					if(route.patches) {
						const patched = patch(newRoute as Parameters<typeof patch>[0], route.patches as Parameters<typeof patch>[1]);

						const result = normalizeRoute(patched, version, getRoute);
						if(result.fails) {
							return result;
						}

						newRoute = result.value as Record<string, unknown>;
					}

					if(route.format) {
						newRoute.$$format = route.format;
					}

					if(route.scope) {
						newRoute.$$scope = route.scope;
					}

					return ok(newRoute);
				}
				else {
					return err(`Cannot find route "${route.$$extend}" for "${JSON.stringify(route)}"`);
				}
			}
		}
		else {
			if(isRecord(route.compose)) {
				for(const name of Object.keys(route.compose)) {
					if(!name.startsWith('$$') || name === '$$default') {
						const result = normalizeRoute(route.compose[name], version, getRoute);
						if(result.fails) {
							return result;
						}

						route.compose[name] = result.value;
					}
				}

				route['map(compose)'] = route.compose;
				route.compose = undefined;
			}
			else if(route.mapSort) {
				const result = normalizeRoute(route.mapSort, version, getRoute);
				if(result.fails) {
					return result;
				}

				route['map(sort)'] = result.value;
				route.mapSort = undefined;
			}
		}

		return ok(route);
	}

	if(isString(route)) {
		if(version >= 3) {
			return ok(getRoute(route) ?? route);
		}
		else {
			return ok(ROUTE_V2_TO_V3[route] ?? route);
		}
	}

	return err(`Cannot normalize route "${JSON.stringify(route)}"`);
}
