import { flow } from 'lodash';
import { Args, Route } from '../types/travel';
import * as YAML from '../parsers/yaml';

function fromYaml({ current, incoming }: { current: string | undefined; incoming: string }): Args<Record<string, any>> {
	return {
		current: typeof current === 'undefined' ? undefined : YAML.parse(current),
		incoming: YAML.parse(incoming),
	};
}

export function yaml(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return flow(fromYaml, ...routes, YAML.stringify);
}
