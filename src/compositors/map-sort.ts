import { type Route } from '../types/travel.js';

const { compare } = new Intl.Collator('en');

export function mapSort(route: Route<Record<string, unknown>>): Route<Record<string, unknown>> {
	return (args) => {
		const result = route(args);

		const sorted: Record<string, unknown> = {};
		const keys = Object.keys(result).sort((a, b) => compare(a, b));

		for(const key of keys) {
			sorted[key] = result[key];
		}

		return sorted;
	};
}
