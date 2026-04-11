import { flow, isPlainObject } from 'lodash-es';
import * as JSON from '../parsers/json.js';
import * as YAML from '../parsers/yaml.js';
import { type Route } from '../types/travel.js';
import { tryJSON } from '../utils/try-json.js';

export function rc(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return ({ current, incoming, filters, ignores }) => {
		const currentData = current && (tryJSON(current) ?? YAML.parse(current));
		const incomingData = incoming && tryJSON(incoming);

		if(incomingData) {
			return flow(...routes, JSON.stringify)({ current: currentData, incoming: incomingData, filters, ignores }) as string;
		}
		else {
			const incomingData = incoming && YAML.parse(incoming);

			if(isPlainObject(incomingData) || Array.isArray(incomingData)) {
				return flow(...routes, YAML.stringify)({ current: currentData, incoming: incomingData, filters, ignores }) as string;
			}
			else {
				return incoming!;
			}
		}
	};
}
