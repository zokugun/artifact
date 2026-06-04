import { isString, isNonNullable } from '@zokugun/is-it-type';
import { type RouteMeta } from '../../types/config.js';

export function getLifecycleRoute(value: Record<string, unknown>, types: string[], getRoute: (name: string) => RouteMeta | undefined): (name: string) => RouteMeta | undefined {
	return (name) => {
		for(const type of types) {
			if(name === type) {
				if(isString(value[type])) {
					name = value[type];
				}
				else if(isNonNullable(value[type])) {
					return value[type];
				}
			}
		}

		return getRoute(name);
	};
}
