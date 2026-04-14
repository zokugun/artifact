import * as YAML from '../parsers/yaml.js';
import { type Route } from '../types/travel.js';
import { applyTransforms } from '../utils/apply-transforms.js';
import { flow } from '../utils/flow.js';

export function yaml(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return async ({ current, incoming, filters, ignores, transforms }) => {
		const currentData = current === undefined ? undefined : YAML.parse(current);
		const incomingData = YAML.parse(incoming!);

		return await flow(...routes, applyTransforms(transforms), YAML.stringify)({ current: currentData, incoming: incomingData, filters, ignores, transforms }) as string;
	};
}
