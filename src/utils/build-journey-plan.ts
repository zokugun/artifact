import { type Journey, type TravelPlan } from '../types/travel.js';

export function buildJourneyPlan(plan: TravelPlan, alias?: string): (basename: string) => Journey | undefined {
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
