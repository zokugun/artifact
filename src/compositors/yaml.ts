import { flow } from 'lodash';
import { Args, Route } from '../types/travel';
import * as YAML from '../parsers/yaml';

function fromYaml({ current, incoming, filters, ignores }: Args<string>): Args<Record<string, any>> {
	return {
		current: typeof current === 'undefined' ? undefined : YAML.parse(current),
		incoming: YAML.parse(incoming!),
		filters,
		ignores,
	};
}

export function yaml(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return flow(fromYaml, ...routes, YAML.stringify);
}
