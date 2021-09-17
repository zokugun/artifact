import { Journey, TravelPlan } from '../types/travel';

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
