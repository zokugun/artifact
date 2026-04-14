import { has, isNil, without } from 'lodash-es';
import { type Route } from '../types/travel.js';

async function apply(map: ComposeMap, keys: string[], current: Record<string, any>, incoming: Record<string, any>, result: Record<string, any>): Promise<void> {
	if(keys.length === 0) {
		return;
	}

	const ignores = map.$$ignore ?? [];

	for(const key of keys) {
		const currentValue = current[key] as unknown;
		const transform = map[key] ?? map.$$default;

		if(!transform || !has(incoming, key) || ignores.includes(key)) {
			if(!isNil(currentValue)) {
				result[key] = currentValue;
			}

			continue;
		}

		const incomingValue = incoming[key] as unknown;

		result[key] = await (transform as Route<unknown>)({
			current: currentValue,
			incoming: incomingValue,
			ignores: map.$$ignore,
		});
	}
}

type ComposeMap = {
	[key: string]: Route<any> | string[] | undefined;

	$$ignore?: string[];
};

export function compose(map: ComposeMap): Route<Record<string, any>> {
	return async ({ current, incoming, filters }) => {
		if(isNil(incoming)) {
			return current ?? {};
		}

		if(isNil(current) || typeof current !== typeof incoming) {
			return incoming;
		}

		const currentKeys = Object.keys(current);
		const incomingKeys = Object.keys(incoming);
		const newKeys = without(incomingKeys, ...currentKeys);

		if(filters) {
			const result = { ...current };

			await apply(map, filters, current, incoming, result);
			await apply(map, newKeys, current, incoming, result);

			return result;
		}
		else {
			const result = {};

			await apply(map, currentKeys, current, incoming, result);
			await apply(map, newKeys, current, incoming, result);

			return result;
		}
	};
}
