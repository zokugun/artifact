import { flow } from 'lodash-es';
import * as YAML from '../parsers/yaml.js';
import { type Args, type Route } from '../types/travel.js';

function fromYaml({ current, incoming, filters, ignores }: Args<string>): Args<Record<string, any>> {
	return {
		current: current === undefined ? undefined : YAML.parse(current),
		incoming: YAML.parse(incoming!),
		filters,
		ignores,
	};
}

export function yaml(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return flow(fromYaml, ...routes, YAML.stringify);
}
