import { Route } from '../types/travel';

type ForkParameter = [(value: any) => boolean, Route<any>] | Route<any>;

export function fork<T>(...cases: ForkParameter[]): Route<T> {
	return ({ current, incoming }) => {
		const targetCase = cases.find((c) => {
			if(!Array.isArray(c)) {
				return c;
			}
			else {
				return c[0](current ?? incoming);
			}
		});

		if(!targetCase) {
			return current ?? incoming!;
		}

		const targetMerge = Array.isArray(targetCase) ? targetCase[1] : targetCase;

		return targetMerge({ current, incoming }) as T;
	};
}
