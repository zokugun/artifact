import { flow, isPlainObject } from 'lodash';
import * as JSON from '../parsers/json';
import * as YAML from '../parsers/yaml';
import { Route } from '../types/travel';
import { tryJson } from '../utils/try-json';

export function rc(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return ({ current, incoming, filters, ignores }) => {
		const currentData = current && (tryJson(current) ?? YAML.parse(current));
		const incomingData = incoming && tryJson(incoming);

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
