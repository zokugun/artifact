import { flow } from 'lodash';
import { Route } from '../types/travel';
import * as JSON from '../parsers/json';
import * as YAML from '../parsers/yaml';

function tryJson(value: string): Record<string, any> | undefined {
	try {
		return JSON.parse(value);
	}
	catch {
		return undefined;
	}
}

export function rc(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return ({ current, incoming, ignores }) => {
		const currentData = current && (tryJson(current) ?? YAML.parse(current));
		const incomingData = incoming && tryJson(incoming);

		if(incomingData) {
			return flow(...routes, JSON.stringify)({ current: currentData, incoming: incomingData, ignores }) as string;
		}
		else {
			return flow(...routes, YAML.stringify)({ current: currentData, incoming: incoming && YAML.parse(incoming), ignores }) as string;
		}
	};
}
