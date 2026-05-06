import { isArray, isNonBlankString, isRecord } from '@zokugun/is-it-type';
import { listConcat } from '../routes/list-concat.js';
import { primitive } from '../routes/primitive.js';
import { type Codec } from '../types/context.js';
import { type Route } from '../types/travel.js';
import { applyTransforms } from '../utils/apply-transforms.js';
import { flow } from '../utils/flow.js';
import { compose } from './compose.js';
import { fork } from './fork.js';

const merge = compose({
	$$default: fork(
		[isArray, listConcat],
		[isRecord, async (...args) => merge(...args)],
		primitive,
	),
});

export function codec(codecs: Codec[], ...routes: Array<Route<Record<string, any>>>): Route<string> {
	return async ({ current, incoming, filters, ignores, transforms }) => {
		if(!isNonBlankString<string>(current)) {
			return incoming!;
		}

		for(const { parse, stringify } of codecs) {
			const currentResult = parse(current);

			if(currentResult.fails) {
				continue;
			}

			if(isNonBlankString<string>(incoming)) {
				const incomingResult = parse(incoming);

				if(incomingResult.fails) {
					continue;
				}

				const incomingData = incomingResult.value.data;

				if(!isArray(incomingData) && !isRecord(incomingData)) {
					return incoming;
				}

				const mergedTransform = currentResult.value.transform
					? await merge({ current: currentResult.value.transform, incoming: incomingResult.value.transform })
					: incomingResult.value.transform;

				const run = flow(...routes, applyTransforms(transforms), (data) => stringify(data as Record<string, unknown>, mergedTransform));

				return run({ current: currentResult.value.data, incoming: incomingData, filters, ignores }) as Promise<string>;
			}
			else {
				const run = flow(...routes, applyTransforms(transforms), (data) => stringify(data as Record<string, unknown>, currentResult.value.transform));

				return run({ current: currentResult.value.data, filters, ignores }) as Promise<string>;
			}
		}

		return incoming!;
	};
}
