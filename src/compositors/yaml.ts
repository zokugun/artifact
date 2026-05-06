import { isArray, isNonBlankString, isRecord } from '@zokugun/is-it-type';
import * as YAML from '../parsers/yaml.js';
import { type Route } from '../types/travel.js';
import { applyTransforms } from '../utils/apply-transforms.js';
import { flow } from '../utils/flow.js';

export function yaml(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return async ({ current, incoming, filters, ignores, transforms }) => {
		if(!isNonBlankString<string>(current)) {
			return incoming!;
		}

		const currentResult = YAML.parse(current);

		if(currentResult.fails) {
			return incoming!;
		}

		if(isNonBlankString<string>(incoming)) {
			const incomingResult = YAML.parse(incoming);

			if(incomingResult.fails) {
				return current;
			}

			const incomingData = incomingResult.value.data;

			if(!isArray(incomingData) && !isRecord(incomingData)) {
				return incoming;
			}

			const run = flow(...routes, applyTransforms(transforms), YAML.stringify);

			return run({ current: currentResult.value.data, incoming: incomingData, filters, ignores }) as Promise<string>;
		}
		else {
			const run = flow(...routes, applyTransforms(transforms), YAML.stringify);

			return run({ current: currentResult.value.data, filters, ignores }) as Promise<string>;
		}
	};
}
