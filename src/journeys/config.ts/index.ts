import { merge } from '@zokugun/configdotts-merge';
import { Args, Route } from '../../types/travel';
import { buildJourneyPlan } from '../../utils/build-journey-plan';
import { buildTravelPlan } from '../../utils/build-travel-plan';

function route({ current, incoming }: Args<string>): string {
	const data = merge(current!, incoming!);

	return data;
}

const travelPlan = buildTravelPlan(
	[/\.config\.ts/, route as Route<string>],
);

export default buildJourneyPlan(travelPlan);
