import { isArray, isNonNullable, isRecord } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import { codec, json, yaml } from '../compositors/index.js';
import { toFormat } from '../parsers/to-format.js';
import { type Route } from '../types/travel.js';
import { buildRoute } from './build-route.js';

export function buildTravel(data: unknown, path: string): DResult<Route<string>> { // {{{
	const result = buildRoute(data);
	if(result.fails) {
		return result;
	}

	const route = result.value;

	if(isRecord(data)) {
		if(data.json || data.rc || data.yaml) {
			return ok(route);
		}
		else if(isNonNullable(data.$$format)) {
			if(data.$$format === 'json') {
				return ok(json(route));
			}
			else if(data.$$format === 'yaml') {
				return ok(yaml(route));
			}
			else if(isArray<Parameters<typeof toFormat>[0]>(data.$$format, (value) => value === 'json' || value === 'jsonc' || value === 'yaml')) {
				const codecs = data.$$format.map((value) => toFormat(value));

				return ok(codec(codecs, route));
			}
		}
	}

	if(path.endsWith('.json')) {
		return ok(json(route));
	}
	else if(path.endsWith('.yaml') || path.endsWith('.yml')) {
		return ok(yaml(route));
	}
	else if(path.endsWith('.js') || path.endsWith('.cjs') || path.endsWith('.mjs') || path.endsWith('.ts')) {
		return ok(route);
	}

	return err('Cannot build travel');
} // }}}
