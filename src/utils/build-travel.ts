import { type DResult, err, ok } from '@zokugun/xtry';
import { json, rc, yaml } from '../compositors/index.js';
import { type Route } from '../types/travel.js';
import { buildRoute } from './build-route.js';

export function buildTravel(route: Record<string, any>): DResult<Route<string>> { // {{{
	if(route.json) {
		const result = buildRoute(route.json);
		if(result.fails) {
			return result;
		}

		return ok(json(result.value));
	}
	else if(route.rc) {
		const result = buildRoute(route.rc);
		if(result.fails) {
			return result;
		}

		return ok(rc(result.value));
	}
	else if(route.yaml) {
		const result = buildRoute(route.yaml);
		if(result.fails) {
			return result;
		}

		return ok(yaml(result.value));
	}
	else {
		return err('Can\'t build route');
	}
} // }}}
