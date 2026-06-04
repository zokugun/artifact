import { isString, isUndefined } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { type RouteMeta, type RouteSpec } from '../../types/config.js';
import { buildRoute } from '../../utils/build-route.js';
import { normalizeRoute } from './normalize-route.js';

const DEFAULT_ROUTES = new Set(['command', 'line(concat)', 'list(concat)', 'list(dedup-first)', 'map(concat)', 'overwrite', 'primitive', 'ts(merge)']);

export function resolveRoute(data: RouteMeta, version: number, getRoute: (name: string) => RouteMeta | undefined): DResult<RouteSpec> {
	while(isString(data)) {
		if(DEFAULT_ROUTES.has(data)) {
			break;
		}

		const newData = getRoute(data);

		if(newData === data || isUndefined(newData)) {
			return err(`Cannot find route: ${data}`);
		}

		data = newData;
	}

	const meta = normalizeRoute(data, version, getRoute);
	if(meta.fails) {
		return meta;
	}

	const route = buildRoute(meta.value);
	if(route.fails) {
		return route;
	}

	return ok({
		meta: meta.value,
		route: route.value,
	});
}
