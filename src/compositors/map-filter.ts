import { isNullable } from '@zokugun/is-it-type';
import { remove } from 'es-toolkit';
import { type Route } from '../types/travel.js';

export function mapFilter(transform: Route<unknown>, skipMissings: string[], removeExistings: string[], skipExistings: string[]): Route<Record<string, unknown>> {
	return async ({ current, incoming }) => {
		if(isNullable(incoming)) {
			return current ?? {};
		}

		current ??= {};

		const currentKeys = Object.keys(current);
		const incomingKeys = Object.keys(incoming);

		const result = {};

		for(const key of currentKeys) {
			if(removeExistings.includes(key)) {
				continue;
			}

			result[key] = current[key];

			if(skipExistings.includes(key)) {
				remove(incomingKeys, (value) => value === key);
			}
		}

		for(const key of incomingKeys) {
			if(skipMissings.includes(key) && !currentKeys.includes(key)) {
				continue;
			}

			result[key] = await transform({
				current: current[key],
				incoming: incoming[key],
			});
		}

		return result;
	};
}
