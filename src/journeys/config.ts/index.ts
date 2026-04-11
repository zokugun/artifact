import { merge } from '@zokugun/configdotts-merge';
import { type Args, type Route } from '../../types/travel.js';
import { buildJourneyPlan } from '../../utils/build-journey-plan.js';
import { buildTravelPlan } from '../../utils/build-travel-plan.js';

function route({ current, incoming }: Args<string>): string {
	const data = merge(current!, incoming!);

	return data;
}

const travelPlan = buildTravelPlan(
	[/\.config\.ts/, route as Route<string>],
);

export default buildJourneyPlan(travelPlan);
