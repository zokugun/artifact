import { type JourneyPlan, type TravelPlan } from '../types/travel.js';

export function buildJourneyPlan(plan: TravelPlan, alias?: string): JourneyPlan {
	return (basename) => {
		const travel = plan(basename);

		if(travel) {
			return {
				travel,
				alias,
			};
		}
		else {
			return undefined;
		}
	};
}
