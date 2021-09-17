import { Route, TravelPlan } from '../types/travel';

export function buildTravelPlan(...mappers: Array<[RegExp | string, Route<string>]>): TravelPlan {
	return (basename) => {
		const mapper = mappers.find((mapper) => {
			if(mapper[0] instanceof RegExp) {
				return mapper[0].test(basename);
			}

			return mapper[0] === basename;
		});

		if(mapper) {
			return mapper[1];
		}
		else {
			return undefined;
		}
	};
}
