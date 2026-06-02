import { isRecord, isString } from '@zokugun/is-it-type';
import { patch } from 'ultrapatch';
import { getPreset } from '../presets/get-preset.js';

const ROUTE_V2_TO_V3 = {
	linesConcat: 'line(concat)',
	listConcat: 'list(concat)',
	mapConcat: 'map(concat)',
	mapSort: 'map(sort)',
	mergeDotJs: 'ts(merge)',
};

export function normalizeRoute(route: unknown, version: number): unknown {
	if(Array.isArray(route)) {
		if(route.length === 0) {
			return route;
		}

		const reversedRoutes = version >= 3 ? route.reverse() : route;

		let newRoute = reversedRoutes.shift() as unknown;

		for(const subroute of reversedRoutes) {
			newRoute = {
				[subroute]: newRoute,
			};
		}

		return normalizeRoute(newRoute, version);
	}

	if(isRecord(route)) {
		if(isRecord(route.fork)) {
			// eslint-disable-next-line logical-assignment-operators
			if(route.fork.array) {
				route.fork.array = normalizeRoute(route.fork.array, version);
			}

			// eslint-disable-next-line logical-assignment-operators
			if(route.fork.object) {
				route.fork.object = normalizeRoute(route.fork.object, version);
			}

			if(route.fork.default) {
				route.fork.default = normalizeRoute(route.fork.default, version);
			}
			// eslint-disable-next-line logical-assignment-operators
			else if(route.fork.$$default) {
				route.fork.$$default = normalizeRoute(route.fork.$$default, version);
			}
		}
		else if(route.json) {
			route.json = normalizeRoute(route.json, version);
		}
		// eslint-disable-next-line logical-assignment-operators
		else if(route.yaml) {
			route.yaml = normalizeRoute(route.yaml, version);
		}

		if(version >= 3) {
			if(isRecord(route['map(compose)'])) {
				const map = route['map(compose)'];

				for(const name of Object.keys(map)) {
					if(name !== '$$ignore' && name !== '$$remove') {
						map[name] = normalizeRoute(map[name], version);
					}
				}
			}
			else if(route['map(sort)']) {
				route['map(sort)'] = normalizeRoute(route['map(sort)'], version);
			}
			else if(route['map(sort, compose)']) {
				const map = route['map(sort, compose)'];

				for(const name of Object.keys(map)) {
					if(name !== '$$ignore' && name !== '$$remove') {
						map[name] = normalizeRoute(map[name], version);
					}
				}

				route['map(sort)'] = {
					'map(compose)': map,
				};
				route['map(sort, compose)'] = undefined;
			}
			else if(isString(route.$$preset)) {
				const preset = getPreset(route.$$preset);

				if(preset) {
					if(route.patches) {
						const patched = patch(preset, route.patches as Parameters<typeof patch>[1]);

						return normalizeRoute(patched, version);
					}

					return preset;
				}
			}
		}
		else {
			if(isRecord(route.compose)) {
				for(const name of Object.keys(route.compose)) {
					if(name !== '$$ignore' && name !== '$$remove') {
						route.compose[name] = normalizeRoute(route.compose[name], version);
					}
				}

				route['map(compose)'] = route.compose;
				route.compose = undefined;
			}
			else if(route.mapSort) {
				route['map(sort)'] = normalizeRoute(route.mapSort, version);
				route.mapSort = undefined;
			}
		}

		return route;
	}

	if(isString(route)) {
		if(version >= 3) {
			const preset = getPreset(route);

			if(preset) {
				return preset;
			}
			else if(route === 'map(sort, concat)') {
				return {
					'map(sort)': 'map(concat)',
				};
			}
		}
		else {
			return ROUTE_V2_TO_V3[route] ?? route;
		}
	}

	return route;
}
