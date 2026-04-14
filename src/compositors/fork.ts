import { type Route } from '../types/travel.js';

export type ForkParameter = [(value: any) => boolean, Route<any>] | Route<any>;

export function fork<T>(...cases: ForkParameter[]): Route<T> {
	return async ({ current, incoming }) => {
		const targetCase = cases.find((c) => {
			if(Array.isArray(c)) {
				return c[0](current ?? incoming);
			}
			else {
				return c;
			}
		});

		if(!targetCase) {
			return current ?? incoming!;
		}

		const targetMerge = Array.isArray(targetCase) ? targetCase[1] : targetCase;

		return targetMerge({ current, incoming }) as T;
	};
}
