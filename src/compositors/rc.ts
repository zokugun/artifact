import { isRecord } from '@zokugun/is-it-type';
import { isArray } from 'lodash-es';
import * as JSON from '../parsers/json.js';
import * as YAML from '../parsers/yaml.js';
import { type Route } from '../types/travel.js';
import { applyTransforms } from '../utils/apply-transforms.js';
import { flow } from '../utils/flow.js';
import { tryJSON } from '../utils/try-json.js';

export function rc(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return async ({ current, incoming, filters, ignores, transforms }) => {
		const currentData = current && (tryJSON(current) ?? YAML.parse(current));
		const incomingData = incoming && tryJSON(incoming);

		if(incomingData) {
			return await flow(...routes, applyTransforms(transforms), JSON.stringify)({ current: currentData, incoming: incomingData, filters, ignores }) as string;
		}
		else {
			const incomingData = incoming && YAML.parse(incoming);

			if(isArray(incomingData) || isRecord(incomingData)) {
				return await flow(...routes, applyTransforms(transforms), YAML.stringify)({ current: currentData, incoming: incomingData, filters, ignores }) as string;
			}
			else {
				return incoming!;
			}
		}
	};
}
