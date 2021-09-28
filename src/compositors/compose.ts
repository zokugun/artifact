import has from 'lodash/has';
import without from 'lodash/without';
import { Route } from '../types/travel';

function apply(map: ComposeMap, keys: string[], current: Record<string, any>, incoming: Record<string, any>, result: Record<string, any>): void {
	if(keys.length === 0) {
		return;
	}

	const ignores = map.$$ignore ?? [];

	for(const key of keys) {
		const currentValue = current[key] as unknown;
		const transform = map[key] ?? map.$$default;

		if(!transform || !has(incoming, key) || ignores.includes(key)) {
			if(currentValue !== undefined) {
				result[key] = currentValue;
			}

			continue;
		}

		const incomingValue = incoming[key] as unknown;

		result[key] = (transform as Route<unknown>)({
			current: currentValue,
			incoming: incomingValue,
			ignores: map.$$ignore,
		});
	}
}

interface ComposeMap {
	[key: string]: Route<any> | string[] | undefined;

	$$ignore?: string[];
}

export function compose(map: ComposeMap): Route<Record<string, any>> {
	return ({ current, incoming, filters }) => {
		if(incoming === undefined) {
			return current ?? {};
		}

		if(current === undefined || typeof current !== typeof incoming) {
			return incoming;
		}

		const currentKeys = Object.keys(current);
		const incomingKeys = Object.keys(incoming);
		const newKeys = without(incomingKeys, ...currentKeys);

		if(filters) {
			const result = { ...current };

			apply(map, filters, current, incoming, result);
			apply(map, newKeys, current, incoming, result);

			return result;
		}
		else {
			const result = {};

			apply(map, currentKeys, current, incoming, result);
			apply(map, newKeys, current, incoming, result);

			return result;
		}
	};
}
