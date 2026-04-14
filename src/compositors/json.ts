import { isArray, isRecord } from '@zokugun/is-it-type';
import * as JSON from '../parsers/json.js';
import * as JSONC from '../parsers/jsonc/index.js';
import { type Transform } from '../parsers/jsonc/transform.js';
import { listConcat, primitive } from '../routes/index.js';
import { type Route } from '../types/travel.js';
import { applyTransforms } from '../utils/apply-transforms.js';
import { flow } from '../utils/flow.js';
import { compose } from './compose.js';
import { fork } from './fork.js';

function tryJson(value: string): Record<string, any> | undefined {
	try {
		return JSON.parse(value);
	}
	catch {
		return undefined;
	}
}

const merge = compose({
	$$default: fork(
		[isArray, listConcat],
		[isRecord, async (...args) => merge(...args)],
		primitive,
	),
});

export function json(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return async ({ current, incoming, filters, ignores, transforms }) => {
		const currentData = current && tryJson(current);
		const incomingData = incoming && tryJson(incoming);

		if((!current || currentData) && (!incoming || incomingData)) {
			return await flow(...routes, applyTransforms(transforms), JSON.stringify)({ current: currentData, incoming: incomingData, filters, ignores, transforms }) as string;
		}
		else {
			const { data: currentData, transform: currentTransform } = JSONC.parse(current) as { data: Record<string, any> | undefined; transform: Transform | undefined };
			const { data: incomingData, transform: incomingTransform } = JSONC.parse(incoming) as { data: Record<string, any> | undefined; transform: Transform | undefined };
			const mergedTransform = await merge({ current: currentTransform, incoming: incomingTransform });
			const toJSON = (data: Record<string, any>) => JSONC.stringify(data, mergedTransform);

			return await flow(...routes, applyTransforms(transforms), toJSON)({ current: currentData, incoming: incomingData, filters, ignores, transforms }) as string;
		}
	};
}
